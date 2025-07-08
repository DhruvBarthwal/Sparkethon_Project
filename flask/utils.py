def generate_output(row, box_encoder, classifier, regressor):
    # Feature engineering: calculate volumes, areas, and ratios
    item_volume = row['Item_L'] * row['Item_W'] * row['Item_H']
    bin_volume = row['Bin_L'] * row['Bin_W'] * row['Bin_H']
    volume_ratio = item_volume / bin_volume if bin_volume != 0 else 0

    item_area = 2 * (row['Item_L'] * row['Item_W'] + row['Item_W'] * row['Item_H'] + row['Item_H'] * row['Item_L'])
    bin_area = 2 * (row['Bin_L'] * row['Bin_W'] + row['Bin_W'] * row['Bin_H'] + row['Bin_H'] * row['Bin_L'])
    area_ratio = item_area / bin_area if bin_area != 0 else 0

    # Create a 12-feature input vector for both classifier and regressor
    features = [[
        row['Item_L'], row['Item_W'], row['Item_H'],
        row['Bin_L'], row['Bin_W'], row['Bin_H'],
        item_volume, bin_volume, volume_ratio,
        item_area, bin_area, area_ratio
    ]]

    # Predict box category
    box_category_encoded = classifier.predict(features)[0]
    box_category = box_encoder.inverse_transform([box_category_encoded])[0]

    # Predict filler amount
    filler_amount = round(regressor.predict(features)[0], 2)

    # Determine packaging type
    packaging_type = "Recycled cardboard box" if box_category in ["Small", "Medium", "Large"] else "Reusable fabric wrap"

    # Filler type logic
    if filler_amount < 0.05:
        filler_type = "No filler needed"
    elif filler_amount < 0.5:
        filler_type = "Paper wrap"
    else:
        filler_type = "Biodegradable peanuts"

    # Environmental impact
    plastic_saved = round(max(0.0, (1.0 - filler_amount) * 0.025), 3)
    co2_saved = round(max(0.0, (1.0 - filler_amount) * 0.15), 3)

    # Cost savings
    base_cost = 1.0
    filler_penalty = min(filler_amount * 0.3, 0.9)
    cost_savings = round(base_cost - filler_penalty, 2)

    # Fit status
    if filler_amount <= 0.1:
        fit_status = "Perfect Fit"
    elif filler_amount <= 0.5:
        fit_status = "Acceptable Fit"
    else:
        fit_status = "No Fit"

    # Arrangement suggestion
    arrangement = "Good arrangement" if fit_status == "Perfect Fit" else (
        "Try repositioning item" if fit_status == "Acceptable Fit" else "Check orientation or larger bin"
    )

    # Eco material suggestion
    eco_swap = "Try mushroom-based wrap for 10% more savings" if filler_type != "No filler needed" else "No alternative filler needed"

    # Anomaly detection
    anomaly = "Anomaly" if filler_amount > 1.0 else "Normal"
    fix = "Re-check packing config" if anomaly == "Anomaly" else "None needed"

    return {
        "Packaging_Type": packaging_type,
        "Box_Dimensions": f"{row['Bin_L']}x{row['Bin_W']}x{row['Bin_H']}",
        "Box_Category": box_category,
        "Filler_Type": filler_type,
        "Filler_Amount": f"{filler_amount} inch",
        "Weather_Recommendation": "Use insulated material" if "humid" in row.get("Weather", "").lower() else "Standard eco-packaging is suitable",
        "Environmental_Impact": {
            "Plastic_Saved_kg": plastic_saved,
            "CO2_Saved_kg": co2_saved
        },
        "Cost_Savings_Per_Unit": f"${cost_savings}",
        "Fit_Status": fit_status,
        "Arrangement": arrangement,
        "Eco_Material_Swap": eco_swap,
        "Anomaly_Label": anomaly,
        "Fix_Suggestion": fix
    }

