import pandas as pd

# Load the CSV
df = pd.read_csv("306_data_subset.csv")

# Get unique values in somite_stage column
unique_stages = df["somite_stage"].unique()

print(unique_stages)

