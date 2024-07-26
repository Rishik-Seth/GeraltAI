from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from datetime import datetime, timezone
import time

SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

SPREADSHEET_ID = '1FasAaxG-qOeq0pWB3hpg0-8yuwj0zDVEyDKrRKegazA'

def check_sheet_exists(service, today):
    sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
    sheets = sheet_metadata.get('sheets', [])

    for sheet in sheets:
        if sheet['properties']['title'] == today:
            return True

    return False

def create_new_sheet(service, today, creds):
    request_body = {
        "requests": [
            {
                "addSheet": {
                    "properties": {
                        "title": today
                    }
                }
            }
        ]
    }
    
    service.spreadsheets().batchUpdate(
        spreadsheetId=SPREADSHEET_ID,
        body=request_body
    ).execute()

    add_entry(service, today, "Student ID", "Out time", "In time")

def create_new_entry(service, today, creds):
    try:
        if not check_sheet_exists(service, today):
            create_new_sheet(service, today, creds)
        else:
            add_entry(service, today, "LCI2021027", "8:00 am", "12:00 pm")
    except HttpError as err:
        print(err)

def add_entry(service, range_name, student_id, in_time, out_time):
    try:
        data = [[student_id, in_time, out_time]]
        sheet = service.spreadsheets()
        sheet.values().append(spreadsheetId=SPREADSHEET_ID,
                              range=range_name,
                              valueInputOption="USER_ENTERED",
                              body={"values":data}).execute()
    except HttpError as err:
        print(err)

def main():
    creds = None
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'google-credentials.json', SCOPES)
            creds = flow.run_local_server(port=2000)
    service = build('sheets', 'v4', credentials=creds)
    today = datetime.date.today().strftime("%d-%m-%Y")

    create_new_entry(service, today, creds)

if __name__ == '__main__':
    # main()
    # Get the current time
    now = datetime.now()

    # Get the current hour, minute, and second
    current_hour = now.hour
    current_minute = now.minute
    current_second = now.second

    # Combine the hour, minute, and second into a single integer
    current_time_as_integer = current_hour * 60*60 + current_minute * 60 + current_second

    print(current_time_as_integer)
    print(time.time())