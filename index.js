/// BUDGET TRACKER
const ctx1 = document.getElementById('dChart');
const ctx2 = document.getElementById('bChart')
let entryCount = 1;
let dChart;
let bChart;

if(sessionStorage.getItem('formData')){
  let data = JSON.parse(sessionStorage.getItem('formData'));
  createDChart(data);
}

//Chart.defaults.global.defaultFontFamily='Montserrat';
//Chart.defaults.global.defaultFontSize=18;

function addEntry(){

    //console.log('Adding new entry...');

    const form = document.getElementById("budget-form")
    const newForm = form.cloneNode(true);

    newForm.id = `budget-form-${entryCount}`;

    newForm.querySelector('.amount').value = '';
    newForm.querySelector('.category').value = '';

    entryCount++;
    newForm.querySelector("#entry-num").textContent = `Entry #${entryCount}`;

    const container = document.getElementById("input-container");
    container.appendChild(newForm);
}

function submitForms() {

    if(dChart) dChart.destroy();

    const incomeForm = document.getElementById("income-form");
    const incomeVal = Number(incomeForm.querySelector(".income").value);
    
    if(!incomeVal){
      alert("Please enter an income value");
      return;
    }
    const allForms = document.querySelectorAll("#input-container form");
    const formData = [];

    allForms.forEach((form, index) => {
      
        if(form.id === "income-form") return;

        const amount = form.querySelector(".amount").value;
        const category = form.querySelector(".category").value;


        if (!amount || !category) {
          alert(`Please fill out all fields in Entry #${index + 1}`);
          return;
      }

        formData.push({
            entry: index,
            amount: parseFloat(amount),
            category
        });
    });

    console.log("Collected Data:");
    console.log({
      income: parseFloat(incomeVal),
      expenses: formData,
    });
    console.log("Cleaned Data: ")

    const cleanData = dataCleaner(formData);
    const totalExpenses = calcExepenses(cleanData);
    const incomeData = [{ label: "Income", value: incomeVal}];
    const graph2Data = [...incomeData, ...totalExpenses];

    console.log(graph2Data);

    console.log(totalExpenses);

    console.log(cleanData);

    sessionStorage.setItem('formData', JSON.stringify(cleanData));
    sessionStorage.setItem('Income', incomeVal);

    createDChart(cleanData, 'doughnut');
    createBChart(graph2Data);
    
}

function dataCleaner(data){
  return data.reduce((accumalator, currentValue) =>{
    const existingCateogry = accumalator.find(
      (item) => item.category === currentValue.category);

    if (existingCateogry){
      existingCateogry.amount += currentValue.amount;
    }else{
      accumalator.push({category: currentValue.category, amount: currentValue.amount});
    }

    return accumalator;
  },[]);  
}

function createDChart(data){

    dChart = new Chart(ctx1,{
        type: 'doughnut',
        data: {
          labels: data.map(row => row.category),
          datasets: [{
            label: 'Money Spent',
            data: data.map(row => row.amount),
            borderWidth: 1,
            hoverBorderWidth: 3
          }]
        },
        options: {
          plugins : {
            title: {
              display: true,
              text: 'Expenses',
              font: {
                size: 30
              },
              padding: {
                top: 10,
                bottom: 15
              }
            },
            tooltip: {
              titleFont: {
                size: 25
              }
            },
            legend: {
              display: true,
              position: 'bottom',
              labels:{
                padding: 20,
                font:{
                  size: 14,
                  family: "'Monstserrat', sans-serif"
                },
                color: '#333'
              }
            }
          },
          layout: {
            padding: {
              top: 10,
              right: 0,
              left: 0,
              bottom: 50
            }
          }
        }
    });
}

function createBChart(data){
  bChart = new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: data.map(row => row.label),
      datasets: [{
        label: 'Income vs Expenses',
        data: data.map(row => row.value),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function calcExepenses(data){
  const total = data.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return [{ label: "Expenses", value: total}];
}