#!/usr/bin/env bash
# Exit on error
set -o errexit

cd backend
pip install --upgrade pip
pip install -r requirements.txt
