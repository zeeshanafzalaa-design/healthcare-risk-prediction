import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt


# -----------------------------------------
# Load Model
# -----------------------------------------

model = joblib.load(
    "models/xgboost_model.pkl"
)


# -----------------------------------------
# Load Test Data
# -----------------------------------------

X_test = pd.read_csv(
    "data/X_test.csv"
)


# -----------------------------------------
# Create SHAP Explainer
# -----------------------------------------

explainer = shap.TreeExplainer(
    model
)


# -----------------------------------------
# Calculate SHAP Values
# -----------------------------------------

shap_values = explainer.shap_values(
    X_test
)


# -----------------------------------------
# SHAP Summary Plot
# -----------------------------------------

shap.summary_plot(
    shap_values,
    X_test,
    show=False
)

plt.title(
    "SHAP Feature Importance"
)

plt.tight_layout()

plt.savefig(
    "data/shap_summary.png"
)

plt.show()