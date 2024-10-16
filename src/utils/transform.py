import json
from collections import defaultdict
import os
def mean_position(positions):
    n = len(positions)
    if n == 0:
        return [0, 0, 0]
    return [sum(coord[i] for coord in positions) / n for i in range(3)]

def build_group_obj(title, position, children):
  return { "title": title,
            "position": position,
            "cameraPosition": position,
            "cameraTarget": position,
            "children": children }
  
def format_data(data):
    formatted = []
    for item in data:
        formatted_item = {
            "title": item["tag"],
            "position": [item["x"], item["y"], item["z"]],
            "cameraPosition": [item["x"] + 1, item["y"] + 1, item["z"] + 1],
            "cameraTarget": [item["x"], item["y"], item["z"]]
        }
        formatted.append(formatted_item)
    return formatted

def group_data(data):
    grouped_data = defaultdict(list)
    for item in data:
        grouped_data[item['name'].replace('/','_')].append(item)
    return dict(grouped_data)

file = 'file_name'

with open(f'{file}.json', 'r') as arquivo_entrada:
    data = json.load(arquivo_entrada)
os.mkdir(file)

grouped_data = group_data(data)

    
output_data = []
for group_name in grouped_data.keys():
    data_formatted = format_data(grouped_data[group_name])
    mean_pos = mean_position([obj['position'] for obj in data_formatted])
    with open(f'{file}/{group_name}.json', 'w') as output_file:
        json.dump(build_group_obj(group_name, mean_pos, data_formatted), output_file, separators=(',', ':'))


