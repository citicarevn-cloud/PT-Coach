"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foodDatabase = void 0;
exports.generateVietnameseMenu = generateVietnameseMenu;
exports.foodDatabase = {
    BREAKFAST: [
        {
            id: "oats-yogurt-banana",
            items: [
                food("Yến mạch", "50 g", 190, 7, 4, 32),
                food("Sữa chua Hy Lạp không đường", "170 g", 100, 17, 0, 6),
                food("Chuối", "1 quả nhỏ", 90, 1, 0, 23),
            ],
        },
        {
            id: "eggs-bread-avocado",
            items: [
                food("Trứng gà luộc", "2 quả", 144, 13, 10, 1),
                food("Bánh mì nguyên cám", "2 lát (70 g)", 175, 7, 3, 31),
                food("Bơ quả", "40 g", 64, 1, 6, 3),
            ],
        },
        {
            id: "chicken-pho",
            items: [
                food("Phở gà ít bánh", "1 tô vừa", 330, 27, 7, 40),
                food("Rau thơm và giá", "100 g", 25, 2, 0, 5),
                food("Trứng chần", "1 quả", 72, 6, 5, 0),
            ],
        },
    ],
    LUNCH: [
        {
            id: "brown-rice-chicken",
            items: [
                food("Cơm gạo lứt chín", "180 g", 200, 5, 2, 42),
                food("Ức gà áp chảo", "180 g", 300, 56, 7, 0),
                food("Rau luộc", "250 g", 85, 5, 1, 15),
            ],
        },
        {
            id: "rice-lean-beef",
            items: [
                food("Cơm trắng chín", "170 g", 221, 4, 1, 49),
                food("Bò nạc xào hành tây", "170 g", 315, 43, 13, 8),
                food("Bông cải xanh hấp", "200 g", 70, 5, 1, 14),
            ],
        },
        {
            id: "rice-steamed-shrimp",
            items: [
                food("Cơm gạo lứt chín", "180 g", 200, 5, 2, 42),
                food("Tôm hấp", "220 g", 220, 52, 3, 1),
                food("Canh bí xanh thịt bằm", "1 tô", 145, 12, 6, 10),
            ],
        },
    ],
    PRE_WORKOUT: [
        {
            id: "sweet-potato-milk",
            items: [
                food("Khoai lang luộc", "180 g", 155, 3, 0, 36),
                food("Sữa tươi không đường", "200 ml", 120, 7, 7, 10),
            ],
        },
        {
            id: "banana-greek-yogurt",
            items: [
                food("Chuối", "1 quả vừa", 105, 1, 0, 27),
                food("Sữa chua Hy Lạp không đường", "170 g", 100, 17, 0, 6),
                food("Hạnh nhân", "15 g", 87, 3, 8, 3),
            ],
        },
        {
            id: "bread-milk",
            items: [
                food("Bánh mì nguyên cám", "2 lát (70 g)", 175, 7, 3, 31),
                food("Sữa ít béo không đường", "200 ml", 90, 7, 3, 10),
            ],
        },
    ],
    DINNER: [
        {
            id: "salmon-tofu-salad",
            items: [
                food("Cá hồi áp chảo", "150 g", 310, 33, 19, 0),
                food("Đậu phụ", "100 g", 80, 9, 5, 2),
                food("Salad rau trộn ít dầu", "250 g", 110, 4, 5, 14),
            ],
        },
        {
            id: "white-fish-sweet-potato",
            items: [
                food("Cá basa nướng", "200 g", 260, 42, 9, 0),
                food("Khoai lang luộc", "180 g", 155, 3, 0, 36),
                food("Rau củ hấp", "250 g", 95, 5, 1, 17),
            ],
        },
        {
            id: "lean-pork-noodle-salad",
            items: [
                food("Thịt thăn heo nướng", "180 g", 285, 49, 9, 0),
                food("Bún gạo lứt chín", "150 g", 165, 4, 1, 36),
                food("Rau sống và dưa leo", "250 g", 65, 4, 1, 11),
            ],
        },
    ],
};
const mealPlan = [
    { type: "BREAKFAST", label: "Bữa sáng", ratio: 0.25 },
    { type: "LUNCH", label: "Bữa trưa", ratio: 0.35 },
    { type: "PRE_WORKOUT", label: "Bữa phụ trước tập", ratio: 0.15 },
    { type: "DINNER", label: "Bữa tối", ratio: 0.25 },
];
function generateVietnameseMenu(targetCaloriesKcal, calciumFocus, random = Math.random) {
    return mealPlan.map((meal) => {
        const option = pickRandom(exports.foodDatabase[meal.type], random);
        const targetKcal = Math.round(targetCaloriesKcal * meal.ratio);
        const baseKcal = option.items.reduce((sum, item) => sum + item.kcal, 0);
        const scale = targetKcal / baseKcal;
        const items = option.items.map((item) => ({
            ...item,
            amount: `${item.amount} (khẩu phần x${scale.toFixed(2)})`,
            kcal: Math.round(item.kcal * scale),
            proteinGrams: round(item.proteinGrams * scale),
            fatGrams: round(item.fatGrams * scale),
            carbGrams: round(item.carbGrams * scale),
        }));
        if (calciumFocus && meal.type === "PRE_WORKOUT") {
            const dairyIndex = items.findIndex((item) => /sữa/i.test(item.name));
            if (dairyIndex >= 0) {
                items[dairyIndex] = {
                    ...items[dairyIndex],
                    name: `${items[dairyIndex].name} tăng cường Canxi/Vitamin D`,
                };
            }
        }
        return {
            type: meal.type,
            label: meal.label,
            optionId: option.id,
            targetKcal,
            portionScale: round(scale),
            items,
            totals: {
                kcal: items.reduce((sum, item) => sum + item.kcal, 0),
                proteinGrams: round(items.reduce((sum, item) => sum + item.proteinGrams, 0)),
                fatGrams: round(items.reduce((sum, item) => sum + item.fatGrams, 0)),
                carbGrams: round(items.reduce((sum, item) => sum + item.carbGrams, 0)),
            },
        };
    });
}
function pickRandom(options, random) {
    const index = Math.min(options.length - 1, Math.floor(Math.max(0, random()) * options.length));
    return options[index];
}
function food(name, amount, kcal, proteinGrams, fatGrams, carbGrams) {
    return { name, amount, kcal, proteinGrams, fatGrams, carbGrams };
}
function round(value) {
    return Math.round(value * 10) / 10;
}
