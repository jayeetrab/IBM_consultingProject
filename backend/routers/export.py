import csv
import io
import xlsxwriter
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.database.db_manager import get_all_posts_list
from io import BytesIO

router = APIRouter()

@router.get("/csv")
async def export_csv():
    posts = await get_all_posts_list()
    output = io.StringIO()
    if posts:
        writer = csv.DictWriter(output, fieldnames=posts[0].keys())
        writer.writeheader()
        writer.writerows(posts)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ibm_campus_pulse.csv"}
    )

@router.get("/xlsx")
async def export_xlsx():
    posts = await get_all_posts_list()
    buffer = BytesIO()
    workbook = xlsxwriter.Workbook(buffer)
    worksheet = workbook.add_worksheet("Engagement Data")
    
    if posts:
        # Write headers
        headers = list(posts[0].keys())
        for col, header in enumerate(headers):
            worksheet.write(0, col, header)
        
        # Write data
        for row, post in enumerate(posts, start=1):
            for col, header in enumerate(headers):
                val = post.get(header)
                if isinstance(val, (list, dict)):
                    val = str(val)
                worksheet.write(row, col, val)
                
    workbook.close()
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ibm_campus_pulse_report.xlsx"}
    )
