```@setup likwid
using LIKWID
```

# GPU Topology

## Example

Query GPU topology information:
```@repl likwid
topo = LIKWID.get_gpu_topology()
topo.devices
gpu = first(topo.devices)
```

## API

```@index
Pages   = ["topo_gpu.md"]
Order   = [:function, :type]
```

### Functions

```@docs
LIKWID.init_topology_gpu()
LIKWID.finalize_topology_gpu()
LIKWID.get_gpu_topology()
```

### Types

```@docs
LIKWID.GpuTopology
LIKWID.GpuDevice
```