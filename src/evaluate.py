import pandas as pd
import joblib

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report,
    confusion_matrix
)


# -----------------------------------------
# Load Test Data
# -----------------------------------------

X_test = pd.read_csv("data/X_test.csv")

y_test = pd.read_csv(
    "data/y_test.csv"
).values.ravel()


# -----------------------------------------
# Load Models
# -----------------------------------------

models = {

    "Logistic Regression":
        joblib.load(
            "models/logistic_model.pkl"
        ),

    "Random Forest":
        joblib.load(
            "models/random_forest_model.pkl"
        ),

    "XGBoost":
        joblib.load(
            "models/xgboost_model.pkl"
        ),

    "LightGBM":
        joblib.load(
            "models/lightgbm_model.pkl"
        )
}


results = []


# -----------------------------------------
# Evaluate Each Model
# -----------------------------------------

for name, model in models.items():

    predictions = model.predict(X_test)

    probabilities = model.predict_proba(
        X_test
    )[:, 1]

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions
    )

    recall = recall_score(
        y_test,
        predictions
    )

    f1 = f1_score(
        y_test,
        predictions
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )


    results.append({

        "Model": name,

        "Accuracy": accuracy,

        "Precision": precision,

        "Recall": recall,

        "F1": f1,

        "ROC_AUC": roc_auc
    })


    print("\n================================")
    print(name)
    print("================================")

    print(
        classification_report(
            y_test,
            predictions
        )
    )


# -----------------------------------------
# Create Results Table
# -----------------------------------------

results_df = pd.DataFrame(results)

print("\n\nMODEL COMPARISON")
print("============================")

print(
    results_df.to_string(
        index=False
    )
)


# -----------------------------------------
# Save Results
# -----------------------------------------

results_df.to_csv(
    "data/model_results.csv",
    index=False
)