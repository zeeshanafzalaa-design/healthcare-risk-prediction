import pandas as pd
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

from xgboost import XGBClassifier
from lightgbm import LGBMClassifier


# -----------------------------------------
# 1. Load Processed Data
# -----------------------------------------

X_train = pd.read_csv("data/X_train.csv")

X_test = pd.read_csv("data/X_test.csv")

y_train = pd.read_csv("data/y_train.csv").values.ravel()

y_test = pd.read_csv("data/y_test.csv").values.ravel()


print("Training data:", X_train.shape)

print("Testing data:", X_test.shape)


# -----------------------------------------
# 2. Logistic Regression
# -----------------------------------------

print("\nTraining Logistic Regression...")

logistic_model = LogisticRegression(
    max_iter=1000
)

logistic_model.fit(
    X_train,
    y_train
)


# -----------------------------------------
# 3. Random Forest
# -----------------------------------------

print("\nTraining Random Forest...")

rf_model = RandomForestClassifier(
    n_estimators=200,
    random_state=42
)

rf_model.fit(
    X_train,
    y_train
)


# -----------------------------------------
# 4. XGBoost
# -----------------------------------------

print("\nTraining XGBoost...")

xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    random_state=42,
    eval_metric="logloss"
)

xgb_model.fit(
    X_train,
    y_train
)


# -----------------------------------------
# 5. LightGBM
# -----------------------------------------

print("\nTraining LightGBM...")

lgbm_model = LGBMClassifier(
    n_estimators=200,
    learning_rate=0.05,
    random_state=42,
    verbosity=-1
)

lgbm_model.fit(
    X_train,
    y_train
)


# -----------------------------------------
# 6. Save Models
# -----------------------------------------

joblib.dump(
    logistic_model,
    "models/logistic_model.pkl"
)

joblib.dump(
    rf_model,
    "models/random_forest_model.pkl"
)

joblib.dump(
    xgb_model,
    "models/xgboost_model.pkl"
)

joblib.dump(
    lgbm_model,
    "models/lightgbm_model.pkl"
)


print("\n================================")
print("ALL MODELS TRAINED SUCCESSFULLY")
print("================================")