from flask_pymongo import PyMongo

mongo = PyMongo()

def db():
    return mongo.db