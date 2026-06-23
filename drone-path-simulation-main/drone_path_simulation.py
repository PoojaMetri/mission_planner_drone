import networkx as nx
import matplotlib.pyplot as plt
from matplotlib.widgets import Button
import heapq

def find_shortest_path(graph, source_node, destination_node, obstacles):
    """
    Dijkstra’s algorithm that ignores nodes in the obstacle list.
    """
    graph_no_obstacles = {
        node: {nbr: w for nbr, w in edges.items() if nbr not in obstacles}
        for node, edges in graph.items() if node not in obstacles
    }

    if source_node in obstacles or destination_node in obstacles:
        print("Source or destination node is blocked by an obstacle!")
        return [], float('inf')

    distances = {node: float('inf') for node in graph_no_obstacles}
    distances[source_node] = 0
    min_heap = [(0, source_node)]
    predecessors = {node: None for node in graph_no_obstacles}

    while min_heap:
        dist, current = heapq.heappop(min_heap)
        if dist > distances[current]:
            continue
        for neighbor, weight in graph_no_obstacles[current].items():
            new_dist = dist + weight
            if new_dist < distances[neighbor]:
                distances[neighbor] = new_dist
                predecessors[neighbor] = current
                heapq.heappush(min_heap, (new_dist, neighbor))

    path = []
    node = destination_node
    while node and node in predecessors:
        path.append(node)
        node = predecessors[node]
    path.reverse()

    if not path or path[0] != source_node:
        return [], float('inf')
    return path, distances[destination_node]


def simulate_drone(graph, path, start_node, destination_node, obstacles):
    if not path:
        print("No valid path to simulate.")
        return

    G = nx.Graph()
    for node, adj in graph.items():
        for neighbor, weight in adj.items():
            G.add_edge(node, neighbor, weight=weight)

    pos = nx.spring_layout(G, seed=42)
    fig, ax = plt.subplots(figsize=(10, 7))
    plt.subplots_adjust(bottom=0.2)

    nx.draw(G, pos, ax=ax, with_labels=True, node_color='lightblue', node_size=700)
    nx.draw_networkx_nodes(G, pos, nodelist=obstacles, node_color='red', node_size=700)
    nx.draw_networkx_nodes(G, pos, nodelist=[start_node], node_color='green', node_size=700)
    nx.draw_networkx_nodes(G, pos, nodelist=[destination_node], node_color='yellow', node_size=700)
    nx.draw_networkx_edge_labels(G, pos, edge_labels={(u, v): d['weight'] for u, v, d in G.edges(data=True)})

    path_edges = list(zip(path, path[1:]))
    nx.draw_networkx_edges(G, pos, edgelist=path_edges, edge_color='orange', width=3)

    
    drone_dot, = ax.plot([], [], 'bo', markersize=15, label="Drone")

    current_index = [0]  

    def update_drone():
        if path:
            x, y = pos[path[current_index[0]]]
            drone_dot.set_data([x], [y])   
            fig.canvas.draw_idle()

    def move_forward(event):
        if current_index[0] < len(path) - 1:
            current_index[0] += 1
            update_drone()

    def move_backward(event):
        if current_index[0] > 0:
            current_index[0] -= 1
            update_drone()

    
    axprev = plt.axes([0.3, 0.05, 0.15, 0.075])
    axnext = plt.axes([0.55, 0.05, 0.15, 0.075])
    btn_back = Button(axprev, 'Back')
    btn_forward = Button(axnext, 'Forward')
    btn_back.on_clicked(move_backward)
    btn_forward.on_clicked(move_forward)

    plt.title("Drone Path Simulation with Obstacle Avoidance")
    plt.legend()
    update_drone()
    plt.show()



def main():
    print("\n🚁 Drone Path Optimization Simulation (Dijkstra + Obstacles)")
    user_choice = input("Use predefined example graph? (yes/no): ").strip().lower()

    if user_choice == 'yes':
        
        graph = {
            'A': {'B': 2, 'D': 8},
            'B': {'A': 2, 'D': 5, 'E': 6},
            'C': {'E': 9, 'F': 3},
            'D': {'A': 8, 'B': 5, 'E': 3, 'F': 2},
            'E': {'C': 9, 'B': 6, 'D': 3, 'F': 1},
            'F': {'D': 2, 'C': 3, 'E': 1}
        }

        obstacles = ['B']   
        start_node = 'A'
        destination_node = 'C'

        path, distance = find_shortest_path(graph, start_node, destination_node, obstacles)
        if not path:
            print("No valid path found due to obstacles.")
        else:
            print(f"Shortest path from {start_node} → {destination_node}: {path}")
            print(f"Total distance: {distance}")
        simulate_drone(graph, path, start_node, destination_node, obstacles)

    else:
        graph = {}
        print("Enter the graph (Node: Neighbor1,weight Neighbor2,weight). Type 'done' when finished.")
        while True:
            line = input("Node and adjacent nodes: ").strip()
            if line.lower() == 'done':
                break
            if ':' not in line:
                print("Invalid format. Use Node: Neighbor,Weight ...")
                continue
            node, neighbors = line.split(':')
            node = node.strip()
            graph[node] = {}
            for pair in neighbors.strip().split():
                try:
                    nbr, w = pair.split(',')
                    graph[node][nbr.strip()] = int(w.strip())
                except:
                    print("Invalid neighbor format. Use Neighbor,Weight")

        start_node = input("Enter start node: ").strip()
        destination_node = input("Enter destination node: ").strip()
        obstacles = input("Enter obstacles (comma-separated): ").strip().split(',')

        path, distance = find_shortest_path(graph, start_node, destination_node, obstacles)
        if not path:
            print("No valid path found (possibly blocked by obstacles).")
        else:
            print(f"Shortest path from {start_node} → {destination_node}: {path}")
            print(f" Total distance: {distance}")
        simulate_drone(graph, path, start_node, destination_node, obstacles)


if __name__ == "__main__":
    main()
