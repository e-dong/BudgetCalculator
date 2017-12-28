# Budget Calculator  
Calculates Budget for the month, using Flask and AJAX to implement a restful service.  

## Installation  
1. Create a virtual environment for Python  
1. From the root of the repository run 'pip install -r requirements.txt'  
1. Add the 'FLASK_APP' variable to your path. (e.g 'export FLASK_APP=budget.py')  
## Executing the App  
Start the application via 'flask run'  

## Notes  
Right after a POST request for /cats or /purchases,  
the app will redirect from the form page to the home page,  
So console logs from the POST request will not persist.  

When budget runs out, the amount of money that went over  
will be the negative cardinality in the budget summary,  
There will also be a red 'flash' that notifies the user  
that she/he has run out of money for that category.  

Overall, the app is fully functional with input validation.  
