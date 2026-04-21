import csv
import io
import xlsxwriter
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from backend.database.db_manager import get_all_posts_list
from io import BytesIO
from collections import defaultdict

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
    bold = workbook.add_format({'bold': True})
    worksheet = workbook.add_worksheet("Engagement Data")
    
    if posts:
        # Write headers
        headers = list(posts[0].keys())
        for col, header in enumerate(headers):
            worksheet.write(0, col, header, bold)
        
        # Write data
        for row, post in enumerate(posts, start=1):
            for col, header in enumerate(headers):
                val = post.get(header)
                if val is None:
                    val = ""
                elif isinstance(val, (list, dict)):
                    val = str(val)
                worksheet.write(row, col, val)
                
    # Sheet 3: Sentiment Analysis
    ws_sentiment = workbook.add_worksheet("Sentiment Matrix")
    ws_sentiment.write(0, 0, "university", bold)
    ws_sentiment.write(0, 1, "positive", bold)
    ws_sentiment.write(0, 2, "neutral", bold)
    ws_sentiment.write(0, 3, "negative", bold)

    # Re-calculate or group by sentiment
    sent_matrix = defaultdict(lambda: defaultdict(int))
    for p in posts:
        sent = p.get("sentiment", "neutral")
        for uni in (p.get("universities") or ["Unknown"]):
            sent_matrix[uni][sent] += 1

    row = 1
    for uni, counts in sorted(sent_matrix.items(), key=lambda x: -sum(x[1].values())):
        ws_sentiment.write(row, 0, uni)
        ws_sentiment.write(row, 1, counts.get("positive", 0))
        ws_sentiment.write(row, 2, counts.get("neutral", 0))
        ws_sentiment.write(row, 3, counts.get("negative", 0))
        row += 1

    workbook.close()
    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=ibm_campus_pulse_report.xlsx"}
    )
