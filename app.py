import streamlit as st
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Set page configuration
st.set_page_config(
    page_title="Data Explorer Dashboard",
    page_icon="📊",
    layout="wide"
)

# Header section
st.title("📊 Data Explorer Dashboard")
st.markdown("""
This app allows you to upload and explore your CSV data files with interactive visualizations.
Upload your data and start exploring!
""")

# Sidebar for controls
st.sidebar.header("Controls")

# File uploader
uploaded_file = st.sidebar.file_uploader("Upload your CSV file", type=["csv"])

# Demo data option
use_demo_data = st.sidebar.checkbox("Use demo data", value=True)

# Load data
if uploaded_file is not None:
    # User uploaded a file
    df = pd.read_csv(uploaded_file)
    st.sidebar.success("✅ File successfully loaded!")
elif use_demo_data:
    # Generate demo data
    st.sidebar.info("ℹ️ Using demo data")
    np.random.seed(42)
    dates = pd.date_range("20230101", periods=100)
    data = {
        "date": dates,
        "sales": np.random.randint(10, 100, size=100),
        "customers": np.random.randint(1, 30, size=100),
        "category": np.random.choice(["A", "B", "C"], size=100),
        "region": np.random.choice(["North", "South", "East", "West"], size=100)
    }
    df = pd.DataFrame(data)
else:
    st.info("Please upload a CSV file or use the demo data")
    st.stop()

# Data overview section
st.header("Data Overview")
col1, col2 = st.columns(2)

with col1:
    st.subheader("Data Preview")
    st.dataframe(df.head(10), use_container_width=True)

with col2:
    st.subheader("Data Summary")
    st.write(f"**Rows:** {df.shape[0]}")
    st.write(f"**Columns:** {df.shape[1]}")
    
    # Display column types
    st.write("**Column Types:**")
    dtypes_df = pd.DataFrame({
        'Column': df.dtypes.index,
        'Type': df.dtypes.values
    })
    st.dataframe(dtypes_df, use_container_width=True)

# Data analysis section
st.header("Data Analysis")

# Select columns for analysis
numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

if numeric_cols:
    # Visualization options
    viz_type = st.selectbox(
        "Select Visualization Type",
        ["Histogram", "Scatter Plot", "Line Chart", "Box Plot", "Correlation Heatmap"]
    )
    
    if viz_type == "Histogram":
        col = st.selectbox("Select column for histogram", numeric_cols)
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.histplot(df[col], kde=True, ax=ax)
        plt.title(f"Histogram of {col}")
        plt.xlabel(col)
        plt.ylabel("Frequency")
        st.pyplot(fig)
        
    elif viz_type == "Scatter Plot":
        col_x = st.selectbox("Select X-axis column", numeric_cols)
        col_y = st.selectbox("Select Y-axis column", numeric_cols, index=min(1, len(numeric_cols)-1))
        
        color_by = None
        if categorical_cols:
            use_color = st.checkbox("Color by category")
            if use_color:
                color_by = st.selectbox("Select category for coloring", categorical_cols)
        
        fig, ax = plt.subplots(figsize=(10, 6))
        if color_by:
            for category, group in df.groupby(color_by):
                ax.scatter(group[col_x], group[col_y], label=category, alpha=0.7)
            ax.legend()
        else:
            ax.scatter(df[col_x], df[col_y], alpha=0.7)
            
        plt.title(f"{col_y} vs {col_x}")
        plt.xlabel(col_x)
        plt.ylabel(col_y)
        st.pyplot(fig)
        
    elif viz_type == "Line Chart":
        if 'date' in df.columns or any('date' in col.lower() for col in df.columns):
            date_cols = [col for col in df.columns if 'date' in col.lower()]
            date_col = st.selectbox("Select date column", date_cols)
            value_col = st.selectbox("Select value column", numeric_cols)
            
            # Convert to datetime if not already
            if not pd.api.types.is_datetime64_any_dtype(df[date_col]):
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
            
            # Group by date if there are duplicates
            chart_data = df.groupby(date_col)[value_col].mean().reset_index()
            chart_data = chart_data.sort_values(by=date_col)
            
            fig, ax = plt.subplots(figsize=(10, 6))
            ax.plot(chart_data[date_col], chart_data[value_col])
            plt.title(f"{value_col} Over Time")
            plt.xlabel(date_col)
            plt.ylabel(value_col)
            plt.xticks(rotation=45)
            plt.tight_layout()
            st.pyplot(fig)
        else:
            st.warning("No date column found for line chart. Please select another visualization.")
            
    elif viz_type == "Box Plot":
        value_col = st.selectbox("Select numeric column", numeric_cols)
        
        if categorical_cols:
            group_col = st.selectbox("Group by (optional)", ["None"] + categorical_cols)
            
            fig, ax = plt.subplots(figsize=(10, 6))
            if group_col != "None":
                sns.boxplot(x=group_col, y=value_col, data=df, ax=ax)
                plt.title(f"Box Plot of {value_col} by {group_col}")
                plt.xlabel(group_col)
                plt.xticks(rotation=45)
            else:
                sns.boxplot(y=value_col, data=df, ax=ax)
                plt.title(f"Box Plot of {value_col}")
            
            plt.ylabel(value_col)
            plt.tight_layout()
            st.pyplot(fig)
        else:
            fig, ax = plt.subplots(figsize=(10, 6))
            sns.boxplot(y=value_col, data=df, ax=ax)
            plt.title(f"Box Plot of {value_col}")
            plt.ylabel(value_col)
            st.pyplot(fig)
            
    elif viz_type == "Correlation Heatmap":
        if len(numeric_cols) > 1:
            corr_cols = st.multiselect("Select columns for correlation", numeric_cols, default=numeric_cols[:min(5, len(numeric_cols))])
            
            if corr_cols:
                corr = df[corr_cols].corr()
                
                fig, ax = plt.subplots(figsize=(10, 8))
                sns.heatmap(corr, annot=True, cmap="coolwarm", vmin=-1, vmax=1, ax=ax)
                plt.title("Correlation Heatmap")
                plt.tight_layout()
                st.pyplot(fig)
            else:
                st.warning("Please select at least one column for correlation analysis.")
        else:
            st.warning("Need at least 2 numeric columns for correlation analysis.")
else:
    st.warning("No numeric columns found in the data for visualization.")

# Filtering section
st.header("Data Filtering")

filter_container = st.container()

with filter_container:
    st.subheader("Filter your data")
    
    # Create filters based on data types
    filters_applied = False
    filtered_df = df.copy()
    
    # Categorical filters
    if categorical_cols:
        st.write("**Categorical Filters:**")
        cat_filters = {}
        
        for col in categorical_cols[:3]:  # Limit to first 3 categorical columns to avoid clutter
            unique_values = df[col].unique().tolist()
            if len(unique_values) <= 10:  # Only show filter if reasonable number of categories
                selected_values = st.multiselect(
                    f"Select {col} values",
                    unique_values,
                    default=unique_values
                )
                if selected_values and set(selected_values) != set(unique_values):
                    cat_filters[col] = selected_values
                    filters_applied = True
    
    # Numeric filters
    if numeric_cols:
        st.write("**Numeric Filters:**")
        num_filters = {}
        
        for col in numeric_cols[:3]:  # Limit to first 3 numeric columns
            min_val = float(df[col].min())
            max_val = float(df[col].max())
            
            col1, col2 = st.columns(2)
            with col1:
                filter_min = st.number_input(f"Min {col}", value=min_val, step=(max_val-min_val)/100)
            with col2:
                filter_max = st.number_input(f"Max {col}", value=max_val, step=(max_val-min_val)/100)
            
            if filter_min > min_val or filter_max < max_val:
                num_filters[col] = (filter_min, filter_max)
                filters_applied = True
    
    # Apply filters
    if filters_applied:
        # Apply categorical filters
        for col, values in cat_filters.items():
            filtered_df = filtered_df[filtered_df[col].isin(values)]
        
        # Apply numeric filters
        for col, (min_val, max_val) in num_filters.items():
            filtered_df = filtered_df[(filtered_df[col] >= min_val) & (filtered_df[col] <= max_val)]
        
        # Show filtered data
        st.subheader("Filtered Data")
        st.write(f"Showing {len(filtered_df)} of {len(df)} rows")
        st.dataframe(filtered_df, use_container_width=True)
        
        # Download filtered data
        csv = filtered_df.to_csv(index=False).encode('utf-8')
        st.download_button(
            "Download filtered data as CSV",
            csv,
            "filtered_data.csv",
            "text/csv",
            key='download-csv'
        )
    else:
        st.info("No filters applied. Adjust the filters above to see filtered data.")

# Footer
st.markdown("---")
st.markdown("Built with Streamlit and Python")
