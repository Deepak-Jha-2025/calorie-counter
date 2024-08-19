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
        <button type="button" class="remove-entry">Remove</button>
    </div>`;

    targetInputContainer.insertAdjacentHTML('beforeend', HTMLString); // Insert new input fields into the DOM
}

// Event listener for handling remove buttons
calorieCounter.addEventListener('click', (e) => {
    // Check if the clicked element is a remove button
    if (e.target?.classList.contains('remove-entry')) {
        // entryToRemove.innerHTML = ''; // only clears the content, doesn't delete the div
        // const entryToRemove = e.target.(parentNode OR parentElement);
        // const entryToRemove = e.target.closest('.entry');
        // entryToRemove.remove(); 

        removeEntry(e); // this manually written fnc, will both remove entry and update entry count
    }
})

function removeEntry(e) {
    const entryToRemove = e.target.closest('.entry');
    const targetInputContainer = entryToRemove.parentNode;

    // Remove the selected entry
    entryToRemove.remove();

    // Re-render the remaining entries to update their labels and IDs
    const remainingEntries = targetInputContainer.querySelectorAll('.entry');

    remainingEntries.forEach((entry, index) => {
        const newEntryNumber = index + 1;

        // Update the label for the entry Name
        const nameLabel = entry.querySelector('label[for*="-name"]');
        nameLabel.setAttribute('for', `entry-${newEntryNumber}-name`);
        nameLabel.textContent = `Entry ${newEntryNumber} Name`;

        // Update input field for entry name
        const nameInput = entry.querySelector('input[id*="-name"]');
        nameInput.setAttribute('id', `entry-${newEntryNumber}-name`)

        // Update the label for the entry Calories
        const caloriesLabel = entry.querySelector('label[for*="-calories"]');
        caloriesLabel.setAttribute('for', `entry-${newEntryNumber}-calories`);
        caloriesLabel.textContent = `Entry ${newEntryNumber} Calories`;

        // Update the input field for the entry Calories
        const caloriesInput = entry.querySelector('input[id*="-calories"]');
        caloriesInput.setAttribute('id', `entry-${newEntryNumber}-calories`);
    })
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
  <canvas id="caloriesChart" width="400" height="200"></canvas>
  `;

    // Create or update the chart
    const ctx = document.getElementById('caloriesChart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut', // Type of the chart (bar, pie, doughnut, etc.)
        data: {
            labels: ['Budgeted', 'Consumed', 'Burned'], // Labels for the chart
            datasets: [{
                label: 'Calories', // Label for the dataset
                data: [budgetCalories, consumedCalories, exerciseCalories], // Data points
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)', // Color for the first bar
                    'rgba(255, 99, 132, 0.2)', // Color for the second bar
                    'rgba(153, 102, 255, 0.2)'  // Color for the third bar
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)', // Border color for the first bar
                    'rgba(255, 99, 132, 1)', // Border color for the second bar
                    'rgba(153, 102, 255, 1)'  // Border color for the third bar
                ],
                borderWidth: 1 // Width of the border around each bar
            }]
        }
    })

    output.insertAdjacentHTML('beforeend', `<button id="downloadPdfBtn">Download PDF Report</button>`);
    const downloadButton = document.getElementById('downloadPdfBtn');
    downloadButton.addEventListener('click', generatePDF);

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

function generatePDF() {
    const doc = new jsPDF('p', 'mm', 'a4'); // Use 'mm' units for A4 page size

    // Add the text data
    doc.setFontSize(16);
    doc.text('Calorie Report', 20, 20);
    doc.setFontSize(12);

    // Retrieve the data from the output section
    const outputLines = output.querySelectorAll('p, span');
    let yOffset = 30;

    outputLines.forEach(line => {
        doc.text(line.textContent, 20, yOffset);
        yOffset += 10;
    })

    // Add the chart as an image
    // Get the actual canvas element (not the context)
    const canvas = document.getElementById('caloriesChart');

    // Convert the chart on the canvas to an image in PNG format
    const chartImage = canvas.toDataURL('image/png');

    // Calculate appropriate dimensions for the image
    const imgWidth = 180; // Width in mm
    const imgHeight = canvas.height * imgWidth / canvas.width;

    // Ensure the height does not exceed page height
    if(yOffset + imgHeight > doc.internal.pageSize.height - 20) {
        // If the image does not fit, add a new page
        doc.addPage();
        yOffset = 20; // Reset yOffset for the new page
    }

    // Add the chart image to the PDF document
    doc.addImage(chartImage, 'PNG', 15, yOffset, imgWidth, imgHeight);


    // Save the PDF
    doc.save('Calroie_Report.pdf');
}

// Event listeners for adding entries, calculating calories, clearing the form & downloading pdf
addEntryButton.addEventListener("click", addEntry);
calorieCounter.addEventListener("submit", calculateCalories);
clearButton.addEventListener('click', clearForm);
