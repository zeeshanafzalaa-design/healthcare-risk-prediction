import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib


# -----------------------------------------
# 1. Load Dataset
# -----------------------------------------

df = pd.read_csv("data/diabetes.csv")

print("Original dataset shape:")
print(df.shape)


# -----------------------------------------
# 2. Handle Invalid Zero Values
# -----------------------------------------

columns_with_invalid_zero = [
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI"
]

for column in columns_with_invalid_zero:

    df[column] = df[column].replace(0, np.nan)


# -----------------------------------------
# 3. Fill Missing Values
# -----------------------------------------

for column in columns_with_invalid_zero:

    df[column] = df[column].fillna(
        df[column].median()
    )


# -----------------------------------------
# 4. Check Missing Values
# -----------------------------------------

print("\nMissing values after cleaning:")
print(df.isnull().sum())


# -----------------------------------------
# 5. Feature Engineering
# -----------------------------------------

df["BMI_Category"] = pd.cut(
    df["BMI"],
    bins=[0, 18.5, 25, 30, float("inf")],
    labels=[0, 1, 2, 3]
).astype(int)


df["Glucose_Category"] = pd.cut(
    df["Glucose"],
    bins=[0, 100, 126, float("inf")],
    labels=[0, 1, 2]
).astype(int)


df["Age_Category"] = pd.cut(
    df["Age"],
    bins=[0, 30, 50, float("inf")],
    labels=[0, 1, 2]
).astype(int)


df["BMI_Glucose_Interaction"] = (
    df["BMI"] * df["Glucose"]
)


# -----------------------------------------
# 6. Separate Features and Target
# -----------------------------------------

X = df.drop("Outcome", axis=1)

y = df["Outcome"]


# -----------------------------------------
# 7. Train/Test Split
# -----------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# -----------------------------------------
# 8. Scale Features
# -----------------------------------------

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)

X_test_scaled = scaler.transform(X_test)


# -----------------------------------------
# 9. Save Scaler
# -----------------------------------------

joblib.dump(
    scaler,
    "models/scaler.pkl"
)


# -----------------------------------------
# 10. Save Processed Data
# -----------------------------------------

X_train.to_csv(
    "data/X_train.csv",
    index=False
)

X_test.to_csv(
    "data/X_test.csv",
    index=False
)

y_train.to_csv(
    "data/y_train.csv",
    index=False
)

y_test.to_csv(
    "data/y_test.csv",
    index=False
)


print("\nPreprocessing completed successfully!")

print("Training data:", X_train.shape)

print("Testing data:", X_test.shape)