# -*- coding: utf-8 -*-
import os

# Mathematical Bold Italic letters via code points
def bold_italic_char(c):
    if 'A' <= c <= 'Z':
        return chr(0x1D400 + ord(c) - ord('A'))
    return c

def bold_italic(text):
    return ''.join(bold_italic_char(c) for c in text)

ELIXIR_BOLD = bold_italic('THE PUNISHER')
BOT_BOLD = bold_italic('BOT')

content = f"""let handler = async (m, {{ conn }}) => {{
  await conn.sendMessage(m.chat, {{
    text:
`*🌐 𝐄𝐜𝐜𝐨 𝐢𝐥 𝐫𝐞𝐩𝐨 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭:*
*https://github.com/Elixir-png/Elixir-Bot1*

*📢 𝐒𝐞𝐠𝐮𝐢 𝐢𝐥 𝐜𝐚𝐧𝐚𝐥𝐞 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐩𝐞𝐫 𝐫𝐢𝐦𝐚𝐧𝐞𝐫𝐞 𝐬𝐞𝐦𝐩𝐫𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨 𝐬𝐮 𝐧𝐨𝐯𝐢𝐭à 𝐞 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐡𝐞!*

*https://whatsapp.com/channel/0029Vb7NyC67tkj0robcbw24* 

*🌟 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐚 𝐥𝐨 𝐬𝐯𝐢𝐥𝐮𝐩𝐩𝐨 𝐝𝐢 𝚃𝙷𝙴 𝙿𝚄𝙽𝙸𝚂𝙷𝙴𝚁-𝙱𝙾𝚃 𝐜𝐨𝐧 𝐮𝐧𝐚 𝐬𝐭𝐞𝐥𝐥𝐚 𝐬𝐮 𝐆𝐢𝐭𝐇𝐮𝐛

> *{THE PUNISHER_BOLD} {BOT_BOLD}*`,
    contextInfo: global.rcanal?.contextInfo || {{}}
  }}, {{ quoted: m }})
}}

handler.help = ['repo', 'infobot']
handler.tags = ['info']
handler.command = ['repo', 'repository', 'github', 'infobot']

export default handler
"""

target = r'c:\Users\admin\Downloads\Elixir-Bot1\plugins\info-repo.js'
with open(target, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Written {len(content)} bytes to {target}")
print(f"File exists: {os.path.exists(target)}")

# Verify content
with open(target, 'r', encoding='utf-8') as f:
    verify = f.read()
print(f"Read back: {len(verify)} bytes")
print("Contains ELIXIR_BOLD:", ELIXIR_BOLD in verify)
print("Contains BOT_BOLD:", BOT_BOLD in verify)

# Show the last line
for line in verify.split('\n'):
    if 'ELIXIR' in line or 'BOT' in line:
        print(f"Line: {repr(line)}")
