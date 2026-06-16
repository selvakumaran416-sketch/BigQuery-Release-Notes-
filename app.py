from flask import Flask, render_template, jsonify
import requests
import xml.etree.ElementTree as ET

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/notes')
def get_notes():
    try:
        # Fetch the RSS/Atom feed
        response = requests.get(FEED_URL, timeout=10)
        response.raise_for_status()
        
        # Parse XML
        root = ET.fromstring(response.content)
        ns = {'atom': 'http://www.w3.org/2005/Atom'}
        
        entries = []
        for entry in root.findall('atom:entry', ns):
            # Extract title
            title_el = entry.find('atom:title', ns)
            title = title_el.text if title_el is not None else 'No Title'
            
            # Extract link
            link = ''
            for link_el in entry.findall('atom:link', ns):
                if link_el.attrib.get('rel') == 'alternate':
                    link = link_el.attrib.get('href', '')
                    break
            
            # Extract updated date
            updated_el = entry.find('atom:updated', ns)
            updated = updated_el.text if updated_el is not None else ''
            
            # Extract content
            content_el = entry.find('atom:content', ns)
            content = content_el.text if content_el is not None else ''
            
            entries.append({
                'title': title,
                'link': link,
                'updated': updated,
                'content': content
            })
            
        return jsonify({'status': 'success', 'data': entries})
    except Exception as e:
        print(f"Error fetching notes: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
