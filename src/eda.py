import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# -----------------------------------------
# 1. Load Dataset
# -----------------------------------------

df = pd.read_csv("data/diabetes.csv")

print("\n========== FIRST 5 ROWS ==========")
print(df.head())

# -----------------------------------------
# 2. Dataset Shape
# -----------------------------------------

print("\n========== DATASET SHAPE ==========")
print(df.shape)

# -----------------------------------------
# 3. Column Names
# -----------------------------------------

print("\n========== COLUMNS ==========")
print(df.columns.tolist())

# -----------------------------------------
# 4. Dataset Information
# -----------------------------------------

print("\n========== DATA INFORMATION ==========")
print(df.info())

# -----------------------------------------
# 5. Statistical Summary
# -----------------------------------------

print("\n========== STATISTICS ==========")
print(df.describe())

# -----------------------------------------
# 6. Missing Values
# -----------------------------------------

print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

# -----------------------------------------
# 7. Target Distribution
# -----------------------------------------

print("\n========== TARGET DISTRIBUTION ==========")
print(df["Outcome"].value_counts())

# -----------------------------------------
# 8. Plot Target Distribution
# -----------------------------------------

sns.countplot(x="Outcome", data=df)

plt.title("Diabetes Outcome Distribution")
plt.xlabel("Outcome")
plt.ylabel("Number of Patients")

plt.show()