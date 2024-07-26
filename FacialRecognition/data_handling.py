import sqlite3 as sl

con = sl.connect("data.db")
from supabase import client, create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# with con:
#     con.execute("""
#         CREATE TABLE USER (
#             id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
#             roll_number TEXT UNIQUE NOT NULL,
#             name TEXT,
#             location TEXT,
#             time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
#         );
#     """)

# with con:
#     con.execute("""
#         DROP TABLE USER;
#     """)

# with con:
#     con.execute("""
#         Delete FROM USER;
#     """)

# sql = 'INSERT INTO USER (roll_number, name, location) values(?, ?, ?)'
# data = [
#     ('LCI2021027','Yatharth Jain', 'Main Gate'),
#     ('LIT2021023','Anushka Tiwari', 'Main Gate'),
# ]
# with con:
#     con.executemany(sql, data)

# with con:
#     data = con.execute("SELECT * FROM USER")
#     for row in data:
#         print(row)


# query="UPDATE USER SET location=?, time= ? "
# data=('Hostel M', time.time())
#     with con:
#         con.execute(query, data)


def DownloadAllTestImages():
    res = supabase.storage.get_bucket("Images").list()
    print(res)
    for folder in res:
        try:
            folderName = folder["name"]
            images = supabase.storage.get_bucket(f"Images").list(path=f"{folderName}")
            # print(images)
            for image in images:
                imageName = image["name"]
                print(f"{folderName}/{imageName}")
                data = supabase.storage.from_("Images").download(
                    f"{folderName}/{imageName}"
                )
                with open(f"images/{imageName}", "wb") as file:
                    file.write(data)
        except Exception as e:
            print(e)


if __name__ == "__main__":
    DownloadAllTestImages()
