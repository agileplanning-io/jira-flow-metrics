import { Edge, Graph, alg } from "@dagrejs/graphlib";
import { Issue, Transition } from "@agileplanning-io/flow-metrics";
import { flatten, isNil, reject, sortBy } from "rambda";

type EdgeWithWeight = {
  edge: Edge;
  weight: number;
};

export const sortStatuses = (stories: Issue[]): string[] => {
  const graph = buildGraph(stories);
  removeCycles(graph);
  return alg.topsort(graph);
};

const buildGraph = (stories: Issue[]) => {
  const graph = new Graph({ directed: true });
  const addTransition = (t: Transition) => {
    // loops can occur if e.g. an issue is moved between projects
    const isLoop = t.fromStatus.name === t.toStatus.name;
    if (!isLoop) {
      const edgeWeight = graph.edge(t.fromStatus.name, t.toStatus.name) ?? 0;
      graph.setEdge(t.fromStatus.name, t.toStatus.name, edgeWeight + 1);
    }
  };

  for (const story of stories) {
    for (const transition of story.transitions) {
      addTransition(transition);
    }
  }

  return graph;
};

const removeCycles = (graph: Graph) => {
  if (alg.isAcyclic(graph)) {
    return;
  }

  const cycles = alg.findCycles(graph);

  const getEdgesInCycle = (cycle: string[]): EdgeWithWeight[] => {
    const edges = cycle.map((v) => {
      return cycle.map((w) => {
        if (v !== w) {
          const weight = graph.edge(v, w);
          if (weight) {
            return { edge: { v, w }, weight };
          }
        }
      });
    });
    return reject(isNil)(flatten(edges));
  };

  for (const cycle of cycles) {
    const edges = getEdgesInCycle(cycle);
    const leastWeighted = sortBy((edge) => edge.weight, edges)[0];
    graph.removeEdge(leastWeighted.edge);
  }

  removeCycles(graph);
};
