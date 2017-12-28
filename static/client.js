/*
 * Setup event listeners
 */
function setup() {
  var catButton = document.getElementById('makeCategory');
  var purButton = document.getElementById('makePurchase');
  if (catButton != null) {
    catButton.addEventListener("click", addCategory, true);
  }
  if (purButton != null) {
    purButton.addEventListener("click", addPurchase, true);
  }
}
getCategories(); // GET the categories
getPurchases(); // GET the purchases

/*
 * Makes POST request via /cats
 */
function addCategory() {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        // POSTED
        console.log("POST /cats");
      }
    }
  };
  httpRequest.open("POST", "/cats");
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  // Get the fields from the form
  var catName = document.getElementById('catName').value;
  var budget = document.getElementById('budget').value;
  // flag budget if invalid type/value
  if (isNaN(budget) || budget <= 0) {
    budget = -1;
  }
  var data = "catName=" + catName + "&budget=" +budget;
  console.log("POSTING: " + data);
  httpRequest.send(data);
}
/*
 * Makes a POST request via /purchases
 */
function addPurchase() {
  var httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        // POSTED
        console.log("POSTED /purchases");
      }
    }
  };
  httpRequest.open("POST", "/purchases");
  httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  // Get the fields from the form
  var amount = document.getElementById('amount').value;
  var item = document.getElementById('item').value;
  var date = document.getElementById('date').value;
  var cat;
  var buttons = document.getElementsByClassName('radioButton');
  for (i = 0; i < buttons.length; i++) {
    if (buttons[i].checked) {
      cat = buttons[i].value; // Find the radiobutton value that was checked
    }
  }
  if (cat == null) { // if a radio button was not checked
    cat = "";
  }
  // Flag amount to -1 if invalid type/value
  if (isNaN(amount) || amount <= 0) {
    amount = -1;
  }

  var data = "amount=" + amount
                  + "&item=" + item
                  + "&date=" + date
                  + "&cat=" + cat;
  console.log("POSTING: " + data);
  httpRequest.send(data);
}

/*
 * Makes a GET request via /purchases
 */
function getPurchases() {
  var httpRequest = new XMLHttpRequest();

  if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var purchases = JSON.parse(httpRequest.responseText);
          console.log("GET /purchases")
          console.log(purchases);
          var board = document.getElementById('purchases');
          if (board != null) {
          // Format/Append each purchase element to the DOM
            for(i = 0; i < purchases.length; i++) {
              var div = document.createElement('div');
              div.setAttribute('class', 'purchase');
              var purchaseText = document.createTextNode("amount: $" + purchases[i].amount.toFixed(2)
                                                      + ", Spent on: " + purchases[i].item
                                                      + ", Date: " + purchases[i].date
                                                      + ", Category: " + purchases[i].cat);
                                                      var p = document.createElement('p');
              p.setAttribute('class', purchases[i].cat);
              p.appendChild(purchaseText);
              div.appendChild(p);
              board.appendChild(div);
            }
            // Calculate the calculate the total uncategorized purchases
            calculateTotalUncategorized(purchases);
          }
        }
      }
    };
    httpRequest.open("GET", "/purchases");
    httpRequest.send();
}
/*
 * Calculates the Total uncategorized purchases
 */
function calculateTotalUncategorized(purchases) {
  // filter purchases that are uncategorized
  var uncategorizedPurchases = purchases.filter(purchase => purchase.cat == "uncategorized");
  var total = 0;
  // Get an array of the amount of each purchase
  var amountArr = uncategorizedPurchases.map(function(purchase) {
    return parseFloat(purchase.amount);
  });
  // Accumulate each element in the array
  total = amountArr.reduce(add, 0);
  var p = document.getElementById('total');
  p.textContent = '$ ' + total.toFixed(2); // Round to 2 decimal places
}
// Accumulator
function add(a, b) {
  return a + b;
}

/*
 * Makes a GET request via /cats
 */
function getCategories() {
  var httpRequest = new XMLHttpRequest();
  if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
  }
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
      var cats = JSON.parse(httpRequest.responseText);
      console.log("GET /cats")
      console.log(cats);
      var board = document.getElementById('cats');
      if (board != null) {
          // Format each Category and append it to the DOM
          for(i = 0; i < cats.length; i++) {
            var div = document.createElement('div');
            var catText = document.createTextNode(cats[i].catName);
            var budgetSummary = document.createTextNode("You have $ " + cats[i].remaining.toFixed(2) + " / $ " + cats[i].budget.toFixed(2 ) + " left to spend.");
            var h3 = document.createElement('h3');
            var p = document.createElement('p');
            p.appendChild(budgetSummary)
            h3.appendChild(catText);
            div.appendChild(h3);
            div.appendChild(p);
            div.setAttribute('id', cats[i].catName);
            // Also add a button that delete the category
            var del_button = document.createElement('button');
            del_button.setAttribute('class', 'btn btn-danger');
            var text_button = document.createTextNode("Delete Category");
            del_button.appendChild(text_button);
            var cat = cats[i].catName;
            addEvent(del_button, cat);
            div.appendChild(del_button);
            board.appendChild(div);
          }
        }
      }
     }
    };
    httpRequest.open("GET", "/cats");
    httpRequest.send();
  }
  // Helper function, adds eventlistener for deleting categories
  function addEvent(button, param) {
    button.addEventListener('click', function() {
      deleteCategory(param);
    }, true);
  }

  /*
   * makes a DELETE request via /cats
   */
  function deleteCategory(name) {
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
      httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var removedCat = JSON.parse(httpRequest.responseText);
          console.log("DELETE /cats")
          console.log(removedCat);
          var board = document.getElementById('cats');
          var remove = document.getElementById(removedCat.catName);
          board.removeChild(remove);
          // Doing a DELETE on a category will cause changes in purchases
          // update purchases by clearing stale data and making another GET request on /purchases
          clearPurchases();
          getPurchases();
       }
      }
    };
    httpRequest.open("DELETE", "/cats/" + name);
    httpRequest.send();
  }
  //  clears all purchases on the DOM
  function clearPurchases() {
    var board = document.getElementById('purchases');
    var purchases = document.getElementsByClassName('purchase');
    purchases = Array.from(purchases);
    purchases.map(function(purchase) {
      board.removeChild(purchase);
    });
  }
// Execute setup on load 
window.addEventListener("load", setup, true);
