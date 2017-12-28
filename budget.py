import json
from flask import  Flask, flash, jsonify, request, abort, url_for, redirect, session, render_template
import time
from datetime import datetime
global success_message
success_message = True
app = Flask(__name__)
# secret key needed to make Flash to work in session
app.secret_key = 'A0Zr98j/3yX R~XHH!jmN]LWX/,?RT'
categories = [] # Represents the budget categories
purchases = [] # Represents the puchases the user makes
# This function formats the datetime for html
def format_datetime(timestamp):
	"""Format a timestamp for display."""
	date = datetime.utcfromtimestamp(timestamp)
	return date.strftime('%Y-%m-%d')

def format_min_date(timestamp):
	date = datetime.utcfromtimestamp(timestamp)
	return date.strftime('%Y-%m-01')

# ######################SITE NAVIGATION Routes here, RESTFUL routes below ##################################
# Default Route: home page
@app.route("/")
def default():
	success = True
	global success_message
	success_message = True
	messages = ["CATEGORY: (" + cat['catName'].upper() + ')  NO MORE MONEY, DEFICIT WARNING' for cat in categories if cat['remaining'] <= 0 ]
	if len(messages) > 0: # indicate when remaining money in budget is less  than or equal to zero
		success = False
		[flash(message) for message in messages]
	return render_template('home.html', success_message = success)

# Naviate to a form to add a new purchase
@app.route("/new-purchase", methods=['GET', 'POST'])
def new_purchase():
	global success_message
	if request.method == 'GET':
		# Get the list of category Names
		catNames = [cat['catName'] for cat in categories]
		# Get Todays Date, to make sure you can only purchase from (past dates - todays date)
		today = time.time()
		todays_date = format_datetime(today)
		min_date = format_min_date(today)
		#flash(min_date)
		#flash(todays_date)
		return render_template('add-purchase.html', min_date = min_date, max_date=todays_date, catNames=catNames)
	else:
		# input validation for /purchases, POST method
		if success_message == False:
			flash("Invalid Input, make sure to choose a category and put a numeric value greater than 0 for amount")
			catNames = [cat['catName'] for cat in categories]
			todays_date = format_datetime(time.time())
			return render_template('add-purchase.html', date=todays_date, catNames=catNames)
		else:
			# Valid input, continue to home page
			return redirect(url_for('default'))

# Navigate to a form to add a new category
@app.route("/new-category", methods=['GET', 'POST'])
def add_category():
	global success_message
	if request.method == 'GET':
		return render_template('add-category.html')
	else:
		# iinput validation for /cats, POST method
		if success_message == False:
			return redirect(url_for('add_category'))
		# successful post, so go to home page
		return redirect(url_for('default'))

################################################# RESTFUL / AJAX routes here ###########################################
# CATEGORIES
@app.route('/cats', methods=['GET'])
def get_cats():
	return jsonify(categories)

@app.route('/cats', methods=['POST'])
def add_cat():
	global success_message
	success_message = False
	if request.form['catName'] == '' or request.form['budget'] == '':
		flash("Don't leave any fields blank")
		return redirect(url_for('add_category'))
	# Type/value Check
	# budget is set to -1 when value is Not a Number or it is <= to zero
	# See client.js in addCategory()
	if float(request.form['budget']) == -1:
		flash("Budget field must be a numeric value that is greater than 0")
		return redirect(url_for('add_category'))
	existingCategories = [cat for cat in categories if cat['catName'] == request.form['catName']]
	if len(existingCategories) != 0:
		flash("Category already exists, please pick a different name")
		return redirect(url_for('add_category'))
	categories.append({"catName": request.form["catName"],"budget": float(request.form["budget"]), "remaining": float(request.form["budget"])})
	success_message = True
	return "ok"

@app.route('/cats/<cat_name>', methods=['DELETE'])
def del_cat(cat_name):
	global success_message
	success_message = True
	cat = [cat for cat in categories if cat["catName"] == cat_name]
	removed_cat = cat[0]
	update_purchases = [purchase for purchase in purchases if purchase['cat'] == cat_name]
	if len(update_purchases) != 0:
		indexes = [purchases.index(purchase) for purchase in update_purchases]
		# When the category is deleted, set the purchases' categories to uncategorized
		for index in indexes:
			purchases[index]['cat'] = "uncategorized"
	# Remove the specified category from list
	categories.remove(removed_cat)
	# returns the removed object
	return jsonify(removed_cat)

# PURCHASES
@app.route('/purchases', methods=['GET'])
def get_purchases():
	return jsonify(purchases)

@app.route('/purchases', methods=['POST'])
def add_purchase():
	global success_message
	success_message = False
	# Form fields cannot be blank
	if request.form['amount'] == '' or request.form['item'] == '' or request.form['date'] == '' or request.form['cat'] == '':
		return redirect(url_for('new_purchase'))
	else:
		# Type/Value check
		# amount is set to 1 when the value entered is not a number or it is <= to zero
		# see client.js in addPurchase()
		if float(request.form['amount']) == -1:
			return redirect(url_for('new_purchase'))
		# Valid fields, so append to purchases
		purchases.append({"amount": float(request.form["amount"]), "item": request.form["item"], "date": request.form["date"], "cat": request.form["cat"]})
		# update the remaining budget for the category
		update_cat = [cat for cat in categories if cat["catName"] == request.form["cat"]][0]
		index = categories.index(update_cat)
		categories[index]["remaining"] = categories[index]["remaining"] - float(request.form["amount"])
		success_message = True
		return "ok"
# END
