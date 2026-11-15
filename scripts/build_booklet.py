"""Build the Fieldwork booklet from the same JSON used by the frontend reader."""
from pathlib import Path
import json
import re
from html import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / 'resources/booklet.json').read_text())
FILES = json.loads((ROOT / 'resources/manifest.json').read_text())
OUTPUT = ROOT / 'resources/files/job-ready-playbook.pdf'
W, H = 595.28, 841.89
INK, MUTED, BG, LINE = map(HexColor, ['#171719', '#68686f', '#ffffff', '#dfdfe3'])
ACCENT, PALE = map(HexColor, ['#002fa7', '#f7f7f8'])
M = 49
styles = {
    'cover-intro': ParagraphStyle('cover-intro', fontName='Helvetica', fontSize=11, leading=18, textColor=HexColor('#ffffff')),
    'intro': ParagraphStyle('intro', fontName='Helvetica', fontSize=11, leading=17.5, textColor=MUTED),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=10, leading=15.7, textColor=MUTED),
    'small': ParagraphStyle('small', fontName='Helvetica', fontSize=8.5, leading=13, textColor=MUTED),
    'example': ParagraphStyle('example', fontName='Helvetica', fontSize=9.2, leading=14, textColor=INK),
    'takeaway': ParagraphStyle('takeaway', fontName='Helvetica', fontSize=14, leading=19.5, textColor=ACCENT),
}

def clean(text):
    return text.replace('\u2011', '-').replace('\u2013', '-').replace('\u2014', '-').replace('\u2019', "'").replace('\u2018', "'")

def paragraph(text, x, y, width, kind='body'):
    p = Paragraph(escape(clean(text)), styles[kind])
    _, height = p.wrap(width, H)
    p.drawOn(c, x, y - height)
    return y - height

def rule(y, x=M, width=W-2*M, color=LINE):
    c.setStrokeColor(color)
    c.setLineWidth(.6)
    c.line(x, y, x + width, y)

def label(text, x, y, color=MUTED, size=8):
    c.saveState()
    c.setFillColor(color)
    c.setFont('Helvetica', size)
    t = c.beginText(x,y)
    t.setCharSpace(1.6)
    t.textOut(clean(text).upper())
    c.drawText(t)
    c.restoreState()

def base(page, section):
    c.setFillColor(BG)
    c.rect(0,0,W,H,fill=1,stroke=0)
    label('FIELDWORK / CAREER PREPARATION', M,H-37,size=7)
    c.setFont('Helvetica',7)
    c.setFillColor(MUTED)
    c.drawRightString(W-M,H-37,section.upper())
    rule(H-49)
    rule(46)
    c.setFont('Helvetica',7.5)
    c.drawString(M,30,'The job-ready playbook')
    c.drawRightString(W-M,30,f'{c.getPageNumber():02d} / {TOTAL_PAGES:02d}' if TOTAL_PAGES else str(c.getPageNumber()))

def fitted_title(text, y, size=31):
    c.setFillColor(INK)
    while c.stringWidth(clean(text),'Helvetica-Bold',size)>W-2*M:
        size -= .5
    c.setFont('Helvetica-Bold',size)
    c.drawString(M,y,clean(text))

def paragraph_height(text, width, kind='body'):
    p = Paragraph(escape(clean(text)), styles[kind])
    return p.wrap(width, H)[1]

def ensure_space(y, height, section):
    if height > H - 160:
        raise RuntimeError('Content block is too tall: ' + section)
    if y - height < 65:
        c.showPage()
        base(c.getPageNumber(), section)
        label('CONTINUED', M, H-81, size=7)
        return H - 106
    return y

def build(output, total_pages=0, known_pages=None):
    global c, TOTAL_PAGES
    TOTAL_PAGES=total_pages
    known_pages=known_pages or {}
    actual_pages={}
    c = canvas.Canvas(str(output), pagesize=(W,H))
    c.setTitle(DATA['title'])
    c.setAuthor('Fieldwork')
    c.setSubject('A practical, general job preparation booklet for freshers and professionals')
    
    # Swiss cover: one accent, sans typography, visible rules, and chapter numerals.
    c.setFillColor(ACCENT)
    c.rect(0,0,W,H,fill=1,stroke=0)
    label('FIELDWORK / CAREER PREPARATION',M,H-49,HexColor('#ffffff'),7)
    c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica',8)
    c.drawRightString(W-M,H-49,'2026')
    c.setStrokeColor(HexColor('#ffffff'));c.setLineWidth(.5);c.line(M,H-70,W-M,H-70)
    c.setFillColor(HexColor('#ffffff'));c.setFont('Helvetica-Bold',62)
    for i,text in enumerate(['The job-ready','playbook.']):c.drawString(M,H-174-i*65,text)
    paragraph('Advice on writing your resume and applying for jobs, with examples you can adapt.',M,H-280,365,'cover-intro')
    c.setStrokeColor(HexColor('#ffffff'));c.line(M,390,W-M,390)
    c.setFont('Helvetica',210);c.drawString(M-9,196,str(len(DATA['chapters'])))
    c.setFont('Helvetica',13);c.drawString(M+240,202,'chapters')
    cell=(W-2*M)/len(DATA['chapters'])
    for i in range(len(DATA['chapters'])):
     x=M+i*cell
     c.setStrokeColor(HexColor('#ffffff'));c.setLineWidth(.5);c.rect(x,132,cell,29,fill=0,stroke=1)
     c.setFont('Helvetica',8);c.drawString(x+9,143,f'{i+1:02d}')
    label('FOR FRESHERS & EXPERIENCED PROFESSIONALS',M,100,HexColor('#ffffff'),6.5)
    c.setStrokeColor(HexColor('#ffffff'));c.line(M,78,W-M,78)
    c.setFont('Helvetica',8);c.drawString(M,55,'November 2026 edition')
    c.drawRightString(W-M,55,'Resume / Job search / Interviews')
    c.showPage()
    
    # Contents and a short reading note.
    base(2,'Contents')
    label(str(len(DATA['chapters']))+' CHAPTERS',M,H-91)
    fitted_title('Inside the playbook.',H-133,30)
    y=paragraph('Read the chapter you need now, or work through the guide in order. Use the checklists to keep track of what you have done.',M,H-160,W-2*M,'intro')-28
    for i,ch in enumerate(DATA['chapters']):
        c.setFillColor(PALE);c.rect(M,y-22,23,23,fill=1,stroke=0)
        c.setFillColor(MUTED);c.setFont('Helvetica',8);c.drawString(M+5,y-14,f'{i+1:02d}')
        c.setFillColor(INK);c.setFont('Helvetica',10);c.drawString(M+37,y-13,clean(ch['title']))
        c.setFillColor(MUTED);c.setFont('Helvetica',9);c.drawRightString(W-M,y-13,f'{known_pages.get(ch["id"],i+3):02d}')
        c.linkRect('',f'chapter-{i}',(M,y-28,W-M,y+5),relative=0,thickness=0)
        y-=min(38,374/len(DATA['chapters']))
    rule(y-3)
    y=paragraph('What to include',M,y-25,W-2*M,'takeaway')-13
    y=paragraph('Write about work you have done. Describe unfinished work as ongoing, and only use numbers you can explain. Replace the bracketed examples with your own details.',M,y,W-2*M,'body')
    paragraph('The resume checklist, project template, and message examples are in the relevant chapters of the website. Sources are at the end of the guide.',M,y-19,W-2*M,'small')
    c.showPage()
    
    for i,ch in enumerate(DATA['chapters']):
        actual_pages[ch['id']]=c.getPageNumber()
        base(c.getPageNumber(),ch['label']);c.bookmarkPage(f'chapter-{i}');c.addOutlineEntry(clean(ch['title']),f'chapter-{i}',0)
        label(f'CHAPTER {i+1:02d} / {ch["label"]}',M,H-91)
        c.setFont('Helvetica',7.5);c.setFillColor(MUTED);c.drawRightString(W-M,H-91,f'{ch["minutes"]} MIN READ')
        fitted_title(ch['title'],H-130)
        y=paragraph(ch['intro'],M,H-154,W-2*M,'intro')-23
        for section in ch['sections']:
            y=ensure_space(y,13+paragraph_height(section['text'],W-2*M)+18,ch['title'])
            c.setFont('Helvetica-Bold',10.5);c.setFillColor(INK);c.drawString(M,y,clean(section['title']))
            y=paragraph(section['text'],M,y-13,W-2*M)-18
        examples=([ch['example']] if ch.get('example') else [])+ch.get('copyBlocks',[])
        if ch.get('copyNote'):
            height=paragraph_height(ch['copyNote'],W-2*M,'body')+18
            y=ensure_space(y,height,ch['title'])
            y=paragraph(ch['copyNote'],M,y,W-2*M)-18
        for example in examples:
            text=example['text']
            p=Paragraph(escape(clean(text)),styles['example']);_,height=p.wrap(W-2*M-32,H)
            boxh=height+40
            y=ensure_space(y,boxh+18,ch['title'])
            c.setFillColor(PALE);c.rect(M,y-boxh,W-2*M,boxh,fill=1,stroke=0)
            label(example['label'],M+15,y-16,ACCENT,6.5)
            p.drawOn(c,M+16,y-28-height)
            y-=boxh+18
        rule(y+2)
        y-=18
        attached=[item for item in FILES if ch['id'] in item['chapters']]
        if attached:
            needed=22+sum(paragraph_height(item['title']+' ('+item['path'].split('/')[-1]+'). Download it from this chapter on the website.',W-2*M,'small')+12 for item in attached)
            y=ensure_space(y,needed,ch['title'])
            label('FILES FOR THIS CHAPTER',M,y,size=7)
            y-=17
            for item in attached:
                y=paragraph(item['title']+' ('+item['path'].split('/')[-1]+'). Download it from this chapter on the website.',M,y,W-2*M,'small')-12
            y-=5
        needed=20+sum(paragraph_height(item,W-2*M-17,'small')+7 for item in ch['checklist'])
        y=ensure_space(y,needed,ch['title'])
        label('CHAPTER CHECKLIST',M,y,size=7)
        y-=17
        for item in ch['checklist']:
            c.setStrokeColor(ACCENT);c.setLineWidth(.7);c.rect(M,y-8,7,7,stroke=1,fill=0)
            y=paragraph(item,M+17,y+1,W-2*M-17,'small')-7
        if y<65:
            raise RuntimeError(f'Chapter {i+1} exceeds its page: bottom at {y:.1f} pt')
        c.showPage()
    
    base(c.getPageNumber(),'Sources & reading notes')
    label('SOURCES & READING NOTES',M,H-91)
    fitted_title('Sources',H-133,32)
    y=paragraph('These pages were checked on 15 November 2026. Adjust the study routine and application targets to fit your day.',M,H-161,W-2*M,'intro')-31
    for s in DATA['sources']:
        needed=14+paragraph_height(s['note'],W-2*M-36)+8+paragraph_height(s['url'].replace('https://',''),W-2*M-36,'small')+29
        y=ensure_space(y,needed,'Sources')
        label(f'[{s["id"]}]',M,y,size=8)
        c.setFillColor(INK);c.setFont('Helvetica-Bold',10);c.drawString(M+36,y,clean(s['title']))
        y=paragraph(s['note'],M+36,y-14,W-2*M-36,'body')-8
        # Keep long URLs readable; each is also a clickable external link.
        url=s['url'];display=url.replace('https://','')
        p=Paragraph(f'<link href="{escape(url)}" color="#002fa7">{escape(display)}</link>',styles['small'])
        _,h=p.wrap(W-2*M-36,H);p.drawOn(c,M+36,y-h);y-=h+29
    page_count=c.getPageNumber()
    c.save()
    return page_count,actual_pages

if __name__ == '__main__':
    temporary=ROOT/'tmp/pdfs/layout-pass.pdf'
    temporary.parent.mkdir(parents=True,exist_ok=True)
    total,chapter_pages=build(temporary)
    final_total,_=build(OUTPUT,total,chapter_pages)
    if final_total != total:
        raise RuntimeError('Pagination changed between PDF passes')
    temporary.unlink()
    print(f'Created {OUTPUT} ({total} pages)')
