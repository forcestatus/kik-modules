// ===============================
// Step 1: Application Data
// ===============================

// Store all recipes in memory
const recipes = [
  {
    id: 1,
    name: "Spaghetti Bolognese",
    baseServings: 4,
    ingredients: [
      { name: "Spaghetti", amount: 400, unit: "g" },
      { name: "Minced Beef", amount: 500, unit: "g" },
      { name: "Tomato Sauce", amount: 2, unit: "cups" }
    ]
  },
  {
    id: 2,
    name: "Vegetable Stir Fry",
    baseServings: 2,
    ingredients: [
      { name: "Mixed Vegetables", amount: 300, unit: "g" },
      { name: "Soy Sauce", amount: 2, unit: "tbsp" },
      { name: "Noodles", amount: 200, unit: "g" }
    ]
  }
];

let selectedRecipe = null;

// ===============================
// Step 2: Initialise App
// ===============================

function initApp() {
  populateRecipeTable();
  clearRecipeDisplay();
}

// ===============================
// Populate Recipe Table
// ===============================

function populateRecipeTable() {
  const tableBody = document.getElementById("recipeTableBody");
  tableBody.innerHTML = "";

  recipes.forEach(recipe => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = recipe.name;

    const actionCell = document.createElement("td");
    const selectButton = document.createElement("button");
    selectButton.textContent = "Select";
    selectButton.onclick = () => selectRecipe(recipe.id);

    actionCell.appendChild(selectButton);

    row.appendChild(nameCell);
    row.appendChild(actionCell);

    tableBody.appendChild(row);
  });
}

// ===============================
// Clear Recipe Display
// ===============================

function clearRecipeDisplay() {
  document.getElementById("ingredientList").innerHTML = "";
  document.getElementById("servings").value = "";
  document.getElementById("servingInfo").textContent = "";
  document.getElementById("selectedRecipeTitle").textContent = "Please select a recipe or add a new one";
  selectedRecipe = null;
}


// ===============================
// Select a Recipe
// ===============================

function selectRecipe(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  selectedRecipe = recipe;

  // Update subheading instead of main heading
  document.getElementById("selectedRecipeTitle").textContent = recipe.name;

  renderIngredients();

  document.getElementById("servings").value = recipe.baseServings;
  document.getElementById("servingInfo").textContent = `Base recipe serves ${recipe.baseServings} people.`;

  showMessage("", "");
}

// ===============================
// Render Ingredients or Remove 
// ===============================

function renderIngredients() {
  const ingredientList = document.getElementById("ingredientList");
  ingredientList.innerHTML = "";

  if (!selectedRecipe || !selectedRecipe.ingredients) return;

  selectedRecipe.ingredients.forEach((ing, index) => {
    const li = document.createElement("li");

    // Ingredient amount span (for scaling)
    const span = document.createElement("span");
    span.className = "ingredient";
    span.setAttribute("data-base", ing.amount);
    span.innerText = ing.amount;

    li.appendChild(span);
    li.appendChild(document.createTextNode(` ${ing.unit} ${ing.name} `));

    // Add Delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => removeIngredient(index);

    li.appendChild(deleteButton);
    ingredientList.appendChild(li);
  });
}

function removeIngredient(index) {
  if (!selectedRecipe) return;

  const removed = selectedRecipe.ingredients.splice(index, 1);
  renderIngredients();
  adjustIngredients();
  showMessage(`Ingredient "${removed[0].name}" removed successfully.`, "success");
}

// ===============================
// Adjust Ingredients by Servings
// ===============================

function adjustIngredients() {
  if (!selectedRecipe) return;

  const servingsInput = document.getElementById("servings");
  let newServings = parseFloat(servingsInput.value);

  if (isNaN(newServings) || newServings <= 0) {
    showMessage("Please enter a valid number of servings.", "error");
    return;
  }

  const ingredientSpans = document.querySelectorAll("#ingredientList .ingredient");
  ingredientSpans.forEach(span => {
    const baseAmount = parseFloat(span.getAttribute("data-base"));
    const scaledAmount = (baseAmount / selectedRecipe.baseServings) * newServings;
    span.innerText = scaledAmount.toFixed(2);
  });

  document.getElementById("servingInfo").textContent = `Base recipe serves ${selectedRecipe.baseServings} people.`;
  showMessage("Ingredient quantities updated.", "success");
}

// ===============================
// Show Feedback Messages
// ===============================

function showMessage(message, type) {
  const box = document.getElementById("messageBox");
  box.textContent = message;
  box.className = type;
}

// ===============================
// Add Ingredient to Selected Recipe
// ===============================

function addIngredient() {
  if (!selectedRecipe) {
    showMessage("Please select a recipe first.", "error");
    return;
  }

  const name = document.getElementById("ingredientName").value.trim();
  const amount = parseFloat(document.getElementById("ingredientAmount").value);
  const unit = document.getElementById("ingredientUnit").value.trim();

  if (!name || isNaN(amount) || amount <= 0 || !unit) {
    showMessage("Please enter valid ingredient name, amount, and unit.", "error");
    return;
  }

  selectedRecipe.ingredients.push({ name, amount, unit });

  document.getElementById("ingredientName").value = "";
  document.getElementById("ingredientAmount").value = "";
  document.getElementById("ingredientUnit").value = "";

  renderIngredients();
  adjustIngredients();

  showMessage(`Ingredient "${name}" added successfully.`, "success");
}

// ===============================
// Add / Update Recipe
// ===============================

function validateForm() {
  const name = document.getElementById("recipeName").value.trim();
  if (!name) {
    showMessage("Please enter a recipe name.", "error");
    return false;
  }

  let recipe = recipes.find(r => r.name.toLowerCase() === name.toLowerCase());
  if (!recipe) {
    const newRecipe = {
      id: recipes.length + 1,
      name: name,
      baseServings: 4,
      ingredients: []
    };
    recipes.push(newRecipe);
    populateRecipeTable();
    showMessage(`Recipe "${name}" added successfully.`, "success");
  } else {
    showMessage(`Recipe "${name}" already exists.`, "error");
  }

  document.getElementById("recipeName").value = "";
  return false; // prevent form reload
}
