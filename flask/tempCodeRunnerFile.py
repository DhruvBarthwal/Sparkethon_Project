from flask import Flask, render_template, request
import pickle
from utils import generate_output

app = Flask(__name__)

# Load your models here
with open("box_encoder.pkl", "rb") as f:
    box_encoder = pickle.load(f)

with open("classifier.pkl", "rb") as f:
    classifier = pickle.load(f)

with open("regressor.pkl", "rb") as f:
    regressor = pickle.load(f)
