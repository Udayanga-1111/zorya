import pathlib, re

print('=== ISSUE 2: calculate_sidereal_positions dead code ===')
files = list(pathlib.Path('backend').rglob('*.py'))
usages = []
for f in files:
    if 'celestial_server' in str(f):
        continue
    text = f.read_text(encoding='utf-8', errors='ignore')
    if 'calculate_sidereal_positions' in text:
        usages.append(str(f))
if usages:
    print('External usages:', usages)
else:
    print('External usages: NONE — dead code confirmed')

print()
print('=== ISSUE 3+4: guardrail sync/async analysis ===')
src_g = pathlib.Path('backend/agents/guardrail_agent.py').read_text()
sync_invokes = re.findall(r'eval_chain\.invoke|reframe.*\.invoke', src_g)
async_invokes = re.findall(r'ainvoke', src_g)
func_defs = re.findall(r'(async def|def) (chat_guardrail_node|guardrail_node)', src_g)
print('Sync .invoke() calls:', sync_invokes)
print('Async .ainvoke() calls:', async_invokes)
print('Function signatures:', func_defs)

print()
print('=== ISSUE 5: Duplicate CBTBlock definitions ===')
src_c = pathlib.Path('backend/mcp_servers/clinical_server.py').read_text()
src_s = pathlib.Path('backend/schemas/agent_schemas.py').read_text()
cbt_in_clinical = 'class CBTBlock' in src_c
cbt_in_schemas = 'class CBTBlock' in src_s
print('clinical_server.py defines CBTBlock:', cbt_in_clinical)
print('agent_schemas.py defines CBTBlock:  ', cbt_in_schemas)

print()
print('=== ISSUE 6: guardrail hard-default ===')
uses_openai = 'ChatOpenAI' in src_g
print('Uses ChatOpenAI fallback:', uses_openai)
# Check if there is a final unconditional safe return in the outer except block
outer_except_match = re.search(r'except Exception as e:.*?return\s*\{', src_g, re.DOTALL)
if outer_except_match:
    snippet = src_g[outer_except_match.start():outer_except_match.start()+300]
    print('Outer except block in guardrail_node:')
    print(snippet[:300])
