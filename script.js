// Get references to key DOM elements by their IDs
const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');
let isError = false; // Flag to track if there's an error in the input

// Function to clean up the input string by removing certain characters
function cleanInputString(str) {
    const regex = /[+-\s]/g; // Regex to match +, -, and whitespace characters
    return str.replace(regex, ''); // Remove matched characters from the string
}

// Function to check for invalid scientific notation inputs like "1e3"
function isInvalidInput(str) {
    const regex = /\d+e\d+/i; // Regex to match numbers in scientific notation
    return str.match(regex); // Return match result or null if no match
}

// Function to add a new entry input field for the selected meal/exercise category
function addEntry() {
    const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
    const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
    const HTMLString = `
    <div class="entry" id="${entryDropdown.value}-${entryNumber}">
        <label for="${entryDropdown.value}-${entryNumber}-name">Entry ${entryNumber} Name</label>
        <input type="text" id="${entryDropdown.value}-${entryNumber}-name" placeholder="Name" />
        <label for="${entryDropdown.value}-${entryNumber}-calories">Entry ${entryNumber} Calories</label>
        <input
            type="number"
            min="0"
            id="${entryDropdown.value}-${entryNumber}-calories"
            placeholder="Calories"
        />
        <button type="button" onclick="removeEntry('${entryDropdown.value}-${entryNumber}')" id="${entryDropdown.value}-${entryNumber}-remove" class="remove-entry">Remove</button>
    </div>`;
    // onclick="removeEntry('${entryDropdown.value}-${entryNumber}')"
    targetInputContainer.insertAdjacentHTML('beforeend', HTMLString); // Insert new input fields into the DOM

    // Event use karna hai to entryDropdown ke basis pe nai kar sakte, uske independent
    // banana hoga
    
    // const removeEntryButton = document.getElementById(`${entryDropdown.value}-${entryNumber}-remove`);
    // if (removeEntryButton) {
    //     removeEntryButton.addEventListener('click', () => {
    //         removeEntry(`${entryDropdown.value}-${entryNumber}`)
    //     })
    // }
}

// Function to remove a newly added entry input field
function removeEntry(entryId) {
    const entryElement = document.getElementById(entryId);
    if (entryElement) {
        entryElement.remove();
    }
}

// Function to calculate total calories and update the output
function calculateCalories(e) {
    e.preventDefault(); // Prevent form submission from refreshing the page
    isError = false; // Reset error flag

    // Get all number input elements for each category
    const breakfastNumberInputs = document.querySelectorAll('#breakfast input[type=number]');
    const lunchNumberInputs = document.querySelectorAll('#lunch input[type=number]');
    const dinnerNumberInputs = document.querySelectorAll('#dinner input[type=number]');
    const snacksNumberInputs = document.querySelectorAll('#snacks input[type=number]');
    const exerciseNumberInputs = document.querySelectorAll('#exercise input[type=number]');

    // Calculate total calories for each category
    const breakfastCalories = getCaloriesFromInputs(breakfastNumberInputs);
    const lunchCalories = getCaloriesFromInputs(lunchNumberInputs);
    const dinnerCalories = getCaloriesFromInputs(dinnerNumberInputs);
    const snacksCalories = getCaloriesFromInputs(snacksNumberInputs);
    const exerciseCalories = getCaloriesFromInputs(exerciseNumberInputs);
    const budgetCalories = getCaloriesFromInputs([budgetNumberInput]);

    // If there's an error in any input, stop the calculation
    if (isError) {
        return;
    }

    // Calculate total consumed and remaining calories
    const consumedCalories = breakfastCalories + lunchCalories + dinnerCalories + snacksCalories;
    const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
    const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';

    // Update the output with the results
    output.innerHTML = `
  <span class="${surplusOrDeficit.toLowerCase()}">${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}</span>
  <hr>
  <p>${budgetCalories} Calories Budgeted</p>
  <p>${consumedCalories} Calories Consumed</p>
  <p>${exerciseCalories} Calories Burned</p>
  `;

    output.classList.remove('hide'); // Make the output visible
}

// Function to sum up calories from an array of input elements
function getCaloriesFromInputs(list) {
    let calories = 0;

    for (const item of list) {
        const currVal = cleanInputString(item.value); // Clean the input value
        const invalidInputMatch = isInvalidInput(currVal); // Check for invalid input

        // If invalid input is detected, show an alert and set the error flag
        if (invalidInputMatch) {
            alert(`Invalid Input: ${invalidInputMatch[0]}`);
            isError = true;
            return null; // Exit the function early due to error
        }
        calories += Number(currVal); // Add the valid input value to the total calories
    }
    return calories; // Return the total calories calculated
}

// Function to clear all input fields and reset the form
function clearForm() {
    const inputContainers = Array.from(document.querySelectorAll('.input-container'));

    // Clear the contents of each input container
    for (const container of inputContainers) {
        container.innerHTML = '';
    }

    // Reset the budget input and hide the output
    budgetNumberInput.value = '';
    output.innerText = '';
    output.classList.add('hide');
}

// Event listeners for adding entries, calculating calories, and clearing the form
addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener('click', clearForm);