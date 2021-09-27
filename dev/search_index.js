var documenterSearchIndex = {"docs":
[{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"using LIKWID","category":"page"},{"location":"likwid-pin/#likwid-pin","page":"likwid-pin","title":"likwid-pin","text":"","category":"section"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"Pinning threads to cores. For details, check out the official documentation.","category":"page"},{"location":"likwid-pin/#Example","page":"likwid-pin","title":"Example","text":"","category":"section"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"(See https://github.com/JuliaPerf/LIKWID.jl/tree/main/examples/pin.)","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"# pin.jl\nusing Base.Threads\n\nglibc_coreid() = @ccall sched_getcpu()::Cint\n\n@threads for i in 1:nthreads()\n    println(\"Thread: $(i), CPU: $(glibc_coreid())\")\nend","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"Running this file with e.g. likwid-pin -s 0xffffffffffffffe1 -c 1,3,5,7 julia -t 4 pin.jl one obtains","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"[pthread wrapper] \n[pthread wrapper] MAIN -> 1\n[pthread wrapper] PIN_MASK: 0->3  1->5  2->7  \n[pthread wrapper] SKIP MASK: 0xFFFFFFFFFFFFFFE1\n\tthreadid 140576878921280 -> SKIP \n\tthreadid 140576612378176 -> hwthread 3 - OK\n\tthreadid 140576590759488 -> hwthread 5 - OK\n\tthreadid 140576494188096 -> hwthread 7 - OK\nThread: 1, CPU: 1\nThread: 2, CPU: 3\nThread: 3, CPU: 5\nThread: 4, CPU: 7","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"If you're wondering about the -s 0xffffffffffffffe1 option, see Mask below.","category":"page"},{"location":"likwid-pin/#Mask","page":"likwid-pin","title":"Mask","text":"","category":"section"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"(See this discussion on the Julia discourse.)","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"In general, likwid-pin pins all pthread-threads. However, julia involves more than the \"Julia user threads\" specified via the -t option. For example, it create an additional unix signal thread (in src/signals-unix.c) and - unless OPENBLAS_NUM_THREADS=1 - the OpenBLAS related threads (blas_thread_init () in [..]/lib/julia/libopenblas64_.so). Hence, when you run likwid-pin -c 0-3 julia -t 4 the four cores (0-3) are actually oversubscribed and multiple \"Julia user threads\" get pinned to the same core.","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"To work around this, we need to provide a mask to likwid-pin via the -s option. To compute an appropriate mask for N \"Julia user threads\" you may use the helper function LIKWID.pin_mask(N):","category":"page"},{"location":"likwid-pin/","page":"likwid-pin","title":"likwid-pin","text":"LIKWID.pin_mask(4)","category":"page"},{"location":"marker_gpu/#Marker-API-(GPU)","page":"GPU","title":"Marker API (GPU)","text":"","category":"section"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"Note: This is a maturing feature. Only NVIDIA GPUs are supported.","category":"page"},{"location":"marker_gpu/#Example","page":"GPU","title":"Example","text":"","category":"section"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"(See https://github.com/JuliaPerf/LIKWID.jl/tree/main/examples/perfctr_gpu.)","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"# perfctr_gpu.jl\nusing LIKWID\nusing LinearAlgebra\nusing CUDA\n\n@assert CUDA.functional()\n\nLIKWID.GPUMarker.init()\n\n# Note: CUDA defaults to Float32\nAgpu = CUDA.rand(128, 64)\nBgpu = CUDA.rand(64, 128)\nCgpu = CUDA.zeros(128, 128)\n\nLIKWID.GPUMarker.startregion(\"matmul\")\nfor _ in 1:100\n    mul!(Cgpu, Agpu, Bgpu)\nend\nLIKWID.GPUMarker.stopregion(\"matmul\")\n\nLIKWID.GPUMarker.close()","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"Running this file with the command likwid-perfctr -G 0 -W FLOPS_SP -m julia perfctr_gpu.jl one should obtain something like the following:","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"--------------------------------------------------------------------------------\nCPU name:\tIntel(R) Xeon(R) Silver 4114 CPU @ 2.20GHz\nCPU type:\tIntel Skylake SP processor\nCPU clock:\t2.20 GHz\n--------------------------------------------------------------------------------\n--------------------------------------------------------------------------------\nRegion matmul, Group 1: FLOPS_SP\n+-------------------+----------+\n|    Region Info    |   GPU 0  |\n+-------------------+----------+\n| RDTSC Runtime [s] | 4.365781 |\n|     call count    |        1 |\n+-------------------+----------+\n\n+----------------------------------------------------+---------+----------+\n|                        Event                       | Counter |   GPU 0  |\n+----------------------------------------------------+---------+----------+\n| SMSP_SASS_THREAD_INST_EXECUTED_OP_FADD_PRED_ON_SUM |   GPU0  |  2457600 |\n| SMSP_SASS_THREAD_INST_EXECUTED_OP_FMUL_PRED_ON_SUM |   GPU1  |  3276800 |\n| SMSP_SASS_THREAD_INST_EXECUTED_OP_FFMA_PRED_ON_SUM |   GPU2  | 52436990 |\n+----------------------------------------------------+---------+----------+\n\n+---------------------+---------+\n|        Metric       |  GPU 0  |\n+---------------------+---------+\n| Runtime (RDTSC) [s] |  4.3658 |\n|     SP [MFLOP/s]    | 25.3353 |\n+---------------------+---------+","category":"page"},{"location":"marker_gpu/#likwid-perfctr-in-a-nutshell","page":"GPU","title":"likwid-perfctr in a nutshell","text":"","category":"section"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"Most importantly, as for CPUs, you need to use the -m option to activate the marker API.","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"To list the available GPU performance groups, run likwid-perfctr -a and look for the lower \"NvMon\" table:","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"[...]\n\nNvMon group name\tDescription\n--------------------------------------------------------------------------------\n    DATA\tLoad to store ratio\nFLOPS_DP\tDouble-precision floating point\nFLOPS_HP\tHalf-precision floating point\nFLOPS_SP\tSingle-precision floating point","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"These groups can be passed to the command line option -W.","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"Another important option is -G <list>, where <list> is a list of GPUs to monitor. Note that GPU ids start with zero (not one).","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"Combinding the points above, the full command could look like this: likwid-perfctr -G 0 -W FLOPS_SP -m julia.","category":"page"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"For more information, check out the official documentation.","category":"page"},{"location":"marker_gpu/#Functions","page":"GPU","title":"Functions","text":"","category":"section"},{"location":"marker_gpu/","page":"GPU","title":"GPU","text":"Modules = [LIKWID.GPUMarker]","category":"page"},{"location":"marker_gpu/#LIKWID.GPUMarker.close-Tuple{}","page":"GPU","title":"LIKWID.GPUMarker.close","text":"Close the connection to the LIKWID GPU Marker API and write out measurement data to file. This file will be evaluated by likwid-perfctr.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.getregion-Tuple{AbstractString}","page":"GPU","title":"LIKWID.GPUMarker.getregion","text":"getregion(regiontag::AbstractString) -> nevents, events, time, count\n\nGet the intermediate results of the region identified by regiontag. On success, it returns     * nevents: the number of events in the current group,     * events: a list with all the aggregated event results,     * time: the measurement time for the region and     * count: the number of calls.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.init-Tuple{}","page":"GPU","title":"LIKWID.GPUMarker.init","text":"Initialize the Nvmon Marker API of the LIKWID library. Must be called previous to all other functions.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.isactive-Tuple{}","page":"GPU","title":"LIKWID.GPUMarker.isactive","text":"Checks whether the NVIDIA GPU Marker API is active, i.e. julia has been started under likwid-perfctr -G ... -W ... -m.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.nextgroup-Tuple{}","page":"GPU","title":"LIKWID.GPUMarker.nextgroup","text":"Switch to the next event set in a round-robin fashion. If you have set only one event set on the command line, this function performs no operation.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.registerregion-Tuple{AbstractString}","page":"GPU","title":"LIKWID.GPUMarker.registerregion","text":"Register a region with name regiontag to the GPU Marker API. On success, true is returned.\n\nThis is an optional function to reduce the overhead of region registration at Marker.startregion. If you don't call registerregion, the registration is done at startregion.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.resetregion-Tuple{AbstractString}","page":"GPU","title":"LIKWID.GPUMarker.resetregion","text":"Reset the values stored using the region name regiontag. On success, true is returned.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.startregion-Tuple{AbstractString}","page":"GPU","title":"LIKWID.GPUMarker.startregion","text":"Start measurements under the name regiontag. On success, true is returned.\n\n\n\n\n\n","category":"method"},{"location":"marker_gpu/#LIKWID.GPUMarker.stopregion-Tuple{AbstractString}","page":"GPU","title":"LIKWID.GPUMarker.stopregion","text":"Stop measurements under the name regiontag. On success, true is returned.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#Performance-Monitoring-(PerfMon)","page":"Performance monitoring","title":"Performance Monitoring (PerfMon)","text":"","category":"section"},{"location":"perfmon/","page":"Performance monitoring","title":"Performance monitoring","text":"The basis functionality of likwid-perfctr.","category":"page"},{"location":"perfmon/#Example","page":"Performance monitoring","title":"Example","text":"","category":"section"},{"location":"perfmon/","page":"Performance monitoring","title":"Performance monitoring","text":"(See https://github.com/JuliaPerf/LIKWID.jl/tree/main/examples/perfmon. Run as julia perfmon.jl.)","category":"page"},{"location":"perfmon/","page":"Performance monitoring","title":"Performance monitoring","text":"# perfmon.jl\nusing LIKWID\nusing LinearAlgebra\n\nA = rand(128, 64)\nB = rand(64, 128)\nC = zeros(128, 128)\n\nncpus = 1\nLIKWID.PerfMon.init([0])\ngroupid = LIKWID.PerfMon.add_event_set(\"FLOPS_DP\")\nLIKWID.PerfMon.setup_counters(groupid)\n\nLIKWID.PerfMon.start_counters()\nfor _ in 1:100\n    mul!(C, A, B)\nend\nLIKWID.PerfMon.stop_counters()\n\nd = LIKWID.PerfMon.get_metric_results(groupid, cpu)\ndisplay(d)\nLIKWID.PerfMon.finalize()\n\n# output\n\nERROR - [./src/power.c:power_init:288] Cannot read MSR TURBO_RATIO_LIMIT_CORES\ncpu = 0","category":"page"},{"location":"perfmon/","page":"Performance monitoring","title":"Performance monitoring","text":"# perfmon.jl\nusing LIKWID\nusing LinearAlgebra\n\nA = rand(128, 64)\nB = rand(64, 128)\nC = zeros(128, 128)\n\n# ncpus = LIKWID.get_cpu_topology().numCoresPerSocket\nncpus = 1\ncpus = collect(0:ncpus-1)\nLIKWID.PerfMon.init(cpus)\ngroupid = LIKWID.PerfMon.add_event_set(\"FLOPS_DP\")\nLIKWID.PerfMon.setup_counters(groupid)\nLIKWID.PerfMon.start_counters()\nfor _ in 1:100\n    mul!(C, A, B)\nend\nLIKWID.PerfMon.stop_counters()\n\nLIKWID.PerfMon.start_counters()\nfor _ in 1:100\n    mul!(C, A, B)\nend\nLIKWID.PerfMon.stop_counters()\n\nfor cpu in cpus\n    @show cpu\n    d = LIKWID.PerfMon.get_metric_results(groupid, cpu)\n    display(d)\n    println()\n    d = LIKWID.PerfMon.get_event_results(groupid, cpu)\n    display(d)\n    println()\nend\nLIKWID.PerfMon.finalize()","category":"page"},{"location":"perfmon/#Functions","page":"Performance monitoring","title":"Functions","text":"","category":"section"},{"location":"perfmon/","page":"Performance monitoring","title":"Performance monitoring","text":"Modules = [LIKWID.PerfMon]","category":"page"},{"location":"perfmon/#LIKWID.PerfMon.add_event_set-Tuple{AbstractString}","page":"Performance monitoring","title":"LIKWID.PerfMon.add_event_set","text":"add_event_set(estr) -> groupid\n\nAdd a performance group or a custom event set to the perfmon module. Returns a groupid which is required to later specify the event set.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_event_results-Tuple{Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_event_results","text":"Get the name and results of all events of a given group for a given cpu thread.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_groups-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_groups","text":"Return a list of all available perfmon groups.\n\nExamples\n\njulia> LIKWID.PerfMon.get_groups()\n8-element Vector{LIKWID.GroupInfoCompact}:\n DATA => Load to store ratio\n FLOPS_DP => Double Precision MFLOP/s\n BRANCH => Branch prediction miss rate/ratio\n ENERGY => Power and Energy consumption\n FLOPS_AVX => Packed AVX MFLOP/s\n DIVIDE => Divide unit information\n FLOPS_SP => Single Precision MFLOP/s\n TMA => Top down cycle allocation\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_id_of_active_group-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_id_of_active_group","text":"Return the groupid of the currently activate group.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_last_metric-Tuple{Integer, Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_last_metric","text":"Return the derived metric result of the last measurement cycle identified by group groupid and the indices for metric metricidx and thread threadidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_last_result-Tuple{Integer, Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_last_result","text":"Return the raw counter register result of the last measurement cycle identified by group groupid and the indices for event eventidx and thread threadidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_longinfo_of_group-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_longinfo_of_group","text":"Return the (long) description of a performance group.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_metric-Tuple{Integer, Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_metric","text":"Return the derived metric result of all measurements identified by group groupid and the indices for metric metricidx and thread threadidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_metric_results-Tuple{Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_metric_results","text":"Get the name and results of all metrics of a given group for a given cpu thread.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_name_of_counter-Tuple{Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_name_of_counter","text":"Return the name of the counter register identified by groupid and eventidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_name_of_event-Tuple{Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_name_of_event","text":"Return the name of the event identified by groupid and eventidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_name_of_group-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_name_of_group","text":"Return the name of the group identified by groupid. If it is a custom event set, the name is set to Custom.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_name_of_metric-Tuple{Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_name_of_metric","text":"Return the name of a derived metric identified by groupid and metricidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_number_of_events-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_number_of_events","text":"Return the amount of events in the group.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_number_of_groups-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_number_of_groups","text":"Return the number of groups currently registered in the perfmon module.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_number_of_metrics-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_number_of_metrics","text":"Return the amount of metrics in the group. Always zero for custom event sets.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_number_of_threads-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_number_of_threads","text":"Return the number of threads initialized in the perfmon module.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_result-Tuple{Integer, Integer, Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_result","text":"Return the raw counter register result of all measurements identified by group groupid and the indices for event eventidx and thread threadidx.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_shortinfo_of_group-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_shortinfo_of_group","text":"Return the short information about a performance group.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.get_time_of_group-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.get_time_of_group","text":"Return the measurement time for group identified by groupid.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.list_metrics-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.list_metrics","text":"List all the metrics of a given group.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.read_counters-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.read_counters","text":"Read the counter registers. To be executed after start_counters and before stop_counters. Returns true on success.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.setup_counters-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.setup_counters","text":"Program the counter registers to measure all events in group groupid. Returns true on success.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.start_counters-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.start_counters","text":"Start the counter registers. Returns true on success.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.stop_counters-Tuple{}","page":"Performance monitoring","title":"LIKWID.PerfMon.stop_counters","text":"Stop the counter registers. Returns true on success.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/#LIKWID.PerfMon.switch_group-Tuple{Integer}","page":"Performance monitoring","title":"LIKWID.PerfMon.switch_group","text":"Switch currently active group to groupid. Returns true on success.\n\n\n\n\n\n","category":"method"},{"location":"perfmon/","page":"Performance monitoring","title":"Performance monitoring","text":"<!– cpu = 0 OrderedCollections.OrderedDict{String, Float64} with 10 entries:   \"Runtime (RDTSC) [s]\" => 0.0719716   \"Runtime unhalted [s]\" => 0.0172482   \"Clock [MHz]\" => 4585.47   \"CPI\" => 1.83921   \"DP [MFLOP/s]\" => 369.924   \"AVX DP [MFLOP/s]\" => 0.0   \"AVX512 DP [MFLOP/s]\" => 0.0   \"Packed [MUOPS/s]\" => 184.962   \"Scalar [MUOPS/s]\" => 0.0   \"Vectorization ratio\" => 100.0 OrderedCollections.OrderedDict{String, Float64} with 7 entries:   \"INSTRRETIREDANY\" => 3.37623e7   \"CPUCLKUNHALTEDCORE\" => 6.2096e7   \"CPUCLKUNHALTEDREF\" => 4.87528e7   \"FPARITHINSTRETIRED128BPACKEDDOUBLE\" => 1.3312e7   \"FPARITHINSTRETIREDSCALARDOUBLE\" => 0.0   \"FPARITHINSTRETIRED256BPACKEDDOUBLE\" => 0.0   \"FPARITHINSTRETIRED512BPACKED_DOUBLE\" => 0.0 –>","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"using LIKWID","category":"page"},{"location":"topo/#CPU-/-NUMA-Topology","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"","category":"section"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"The basis functionality of likwid-topology.","category":"page"},{"location":"topo/#Example","page":"CPU / NUMA Topology","title":"Example","text":"","category":"section"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"Query CPU topology information:","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"topo = LIKWID.get_cpu_topology()\ntopo.threadPool\ntopo.cacheLevels","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"Get detailed CPU information:","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"cpuinfo = LIKWID.get_cpu_info()","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"Query information about NUMA nodes:","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"numa = LIKWID.get_numa_topology()\nnuma.nodes\nnuma_node = first(numa.nodes)","category":"page"},{"location":"topo/#Graphical-output","page":"CPU / NUMA Topology","title":"Graphical output","text":"","category":"section"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"Currently, LIKWID.jl doesn't feature a native graphical visualization of the CPU topology. However, it provides a small \"wrapper function\" around likwid-topology -g which should give you an output like this:","category":"page"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"LIKWID.print_cpu_topology()","category":"page"},{"location":"topo/#Functions","page":"CPU / NUMA Topology","title":"Functions","text":"","category":"section"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"LIKWID.init_topology()\nLIKWID.finalize_topology()\nLIKWID.get_cpu_topology()\nLIKWID.get_cpu_info()\nLIKWID.print_supported_cpus()\nLIKWID.init_numa()\nLIKWID.finalize_numa()\nLIKWID.get_numa_topology()","category":"page"},{"location":"topo/#LIKWID.init_topology-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.init_topology","text":"Initialize LIKWIDs topology module.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.finalize_topology-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.finalize_topology","text":"Close and finalize LIKWIDs topology module.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.get_cpu_topology-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.get_cpu_topology","text":"get_cpu_topology() -> CpuTopology\n\nGet the CPU topology of the machine.\n\nAutomatically initializes the topology and NUMA modules, i.e. calls init_topology and init_numa.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.get_cpu_info-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.get_cpu_info","text":"get_cpu_info() -> CpuInfo\n\nGet detailed information about the CPU.\n\nAutomatically initializes the topology and NUMA modules, i.e. calls init_topology and init_numa.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.print_supported_cpus-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.print_supported_cpus","text":"print_supported_cpus(; cprint=true)\n\nPrint a list of all supported CPUs.\n\nIf cprint=false, LIKWID.jl will first capture the stdout and then print the list.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.init_numa-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.init_numa","text":"Initialize LIKWIDs NUMA module.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.finalize_numa-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.finalize_numa","text":"Close and finalize LIKWIDs NUMA module.\n\n\n\n\n\n","category":"method"},{"location":"topo/#LIKWID.get_numa_topology-Tuple{}","page":"CPU / NUMA Topology","title":"LIKWID.get_numa_topology","text":"get_numa_topology() -> NumaTopology\n\nGet the NUMA topology of the machine.\n\nAutomatically initializes the topology, NUMA, and affinity modules, i.e. calls init_topology, init_numa, and init_affinity.\n\n\n\n\n\n","category":"method"},{"location":"topo/#Types","page":"CPU / NUMA Topology","title":"Types","text":"","category":"section"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"LIKWID.CpuTopology\nLIKWID.CpuInfo\nLIKWID.HWThread\nLIKWID.CacheLevel\nLIKWID.NumaTopology\nLIKWID.NumaNode","category":"page"},{"location":"topo/#LIKWID.CpuTopology","page":"CPU / NUMA Topology","title":"LIKWID.CpuTopology","text":"CPU topology information\n\n\n\n\n\n","category":"type"},{"location":"topo/#LIKWID.CpuInfo","page":"CPU / NUMA Topology","title":"LIKWID.CpuInfo","text":"CPU information\n\n\n\n\n\n","category":"type"},{"location":"topo/#LIKWID.HWThread","page":"CPU / NUMA Topology","title":"LIKWID.HWThread","text":"Information about a hardware thread\n\n\n\n\n\n","category":"type"},{"location":"topo/#LIKWID.CacheLevel","page":"CPU / NUMA Topology","title":"LIKWID.CacheLevel","text":"Information about a cache level\n\n\n\n\n\n","category":"type"},{"location":"topo/#LIKWID.NumaTopology","page":"CPU / NUMA Topology","title":"LIKWID.NumaTopology","text":"CPU topology information\n\n\n\n\n\n","category":"type"},{"location":"topo/#LIKWID.NumaNode","page":"CPU / NUMA Topology","title":"LIKWID.NumaNode","text":"Information about a NUMA node\n\n\n\n\n\n","category":"type"},{"location":"topo/#Supported-CPUs","page":"CPU / NUMA Topology","title":"Supported CPUs","text":"","category":"section"},{"location":"topo/","page":"CPU / NUMA Topology","title":"CPU / NUMA Topology","text":"LIKWID.print_supported_cpus()\nLIKWID.print_supported_cpus(; cprint=false) # hide","category":"page"},{"location":"marker/#Marker-API-(CPU)","page":"CPU","title":"Marker API (CPU)","text":"","category":"section"},{"location":"marker/#Example","page":"CPU","title":"Example","text":"","category":"section"},{"location":"marker/","page":"CPU","title":"CPU","text":"(See https://github.com/JuliaPerf/LIKWID.jl/tree/main/examples/perfctr.)","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"# perfctr.jl\nusing LIKWID\nusing LinearAlgebra\n\nLIKWID.Marker.init()\n\nA = rand(128, 64)\nB = rand(64, 128)\nC = zeros(128, 128)\n\nLIKWID.Marker.startregion(\"matmul\")\nfor _ in 1:100\n    mul!(C, A, B)\nend\nLIKWID.Marker.stopregion(\"matmul\")\n\nLIKWID.Marker.close()","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Running this file with the command likwid-perfctr -C 0 -g FLOPS_DP -m julia perfctr.jl one should obtain something like the following:","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"--------------------------------------------------------------------------------\nCPU name:\t11th Gen Intel(R) Core(TM) i7-11700K @ 3.60GHz\nCPU type:\tIntel Rocketlake processor\nCPU clock:\t3.60 GHz\n--------------------------------------------------------------------------------\n--------------------------------------------------------------------------------\nRegion matmul, Group 1: FLOPS_DP\n+-------------------+------------+\n|    Region Info    | HWThread 0 |\n+-------------------+------------+\n| RDTSC Runtime [s] |   0.465348 |\n|     call count    |          1 |\n+-------------------+------------+\n\n+------------------------------------------+---------+------------+\n|                   Event                  | Counter | HWThread 0 |\n+------------------------------------------+---------+------------+\n|             INSTR_RETIRED_ANY            |  FIXC0  | 4414042000 |\n|           CPU_CLK_UNHALTED_CORE          |  FIXC1  | 2237935000 |\n|           CPU_CLK_UNHALTED_REF           |  FIXC2  | 1648606000 |\n| FP_ARITH_INST_RETIRED_128B_PACKED_DOUBLE |   PMC0  |  106496000 |\n|    FP_ARITH_INST_RETIRED_SCALAR_DOUBLE   |   PMC1  |        569 |\n| FP_ARITH_INST_RETIRED_256B_PACKED_DOUBLE |   PMC2  |          0 |\n| FP_ARITH_INST_RETIRED_512B_PACKED_DOUBLE |   PMC3  |          0 |\n+------------------------------------------+---------+------------+\n\n+----------------------+------------+\n|        Metric        | HWThread 0 |\n+----------------------+------------+\n|  Runtime (RDTSC) [s] |     0.4653 |\n| Runtime unhalted [s] |     0.6217 |\n|      Clock [MHz]     |  4886.7513 |\n|          CPI         |     0.5070 |\n|     DP [MFLOP/s]     |   457.7061 |\n|   AVX DP [MFLOP/s]   |          0 |\n|  AVX512 DP [MFLOP/s] |          0 |\n|   Packed [MUOPS/s]   |   228.8524 |\n|   Scalar [MUOPS/s]   |     0.0012 |\n|  Vectorization ratio |    99.9995 |\n+----------------------+------------+","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Sidenote: Given the absence of AVX calls, it seems like OpenBLAS is falling back to a suboptimal Nehalem kernel. If we install MKL.jl and add using MKL to the top of our script above, the metrics table becomes","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"+----------------------+------------+\n|        Metric        | HWThread 0 |\n+----------------------+------------+\n|  Runtime (RDTSC) [s] |     0.4599 |\n| Runtime unhalted [s] |     0.6065 |\n|      Clock [MHz]     |  4888.9102 |\n|          CPI         |     0.5145 |\n|     DP [MFLOP/s]     |   459.6089 |\n|   AVX DP [MFLOP/s]   |   459.6080 |\n|  AVX512 DP [MFLOP/s] |   459.6080 |\n|   Packed [MUOPS/s]   |    57.4510 |\n|   Scalar [MUOPS/s]   |     0.0008 |\n|  Vectorization ratio |    99.9986 |\n+----------------------+------------+","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"<!– ## Most important Functions","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"LIKWID.Marker.init()\nLIKWID.Marker.startregion(regiontag::AbstractString)\nLIKWID.Marker.stopregion(regiontag::AbstractString)\nLIKWID.Marker.close()","category":"page"},{"location":"marker/#LIKWID.Marker.init-Tuple{}","page":"CPU","title":"LIKWID.Marker.init","text":"Initialize the Marker API. Must be called previous to all other functions.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.startregion-Tuple{AbstractString}","page":"CPU","title":"LIKWID.Marker.startregion","text":"Start measurements under the name regiontag. On success, true is returned.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.stopregion-Tuple{AbstractString}","page":"CPU","title":"LIKWID.Marker.stopregion","text":"Stop measurements under the name regiontag. On success, true is returned.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.close-Tuple{}","page":"CPU","title":"LIKWID.Marker.close","text":"Close the connection to the LIKWID Marker API and write out measurement data to file. This file will be evaluated by likwid-perfctr.\n\n\n\n\n\n","category":"method"},{"location":"marker/","page":"CPU","title":"CPU","text":"–>","category":"page"},{"location":"marker/#likwid-perfctr-in-a-nutshell","page":"CPU","title":"likwid-perfctr in a nutshell","text":"","category":"section"},{"location":"marker/","page":"CPU","title":"CPU","text":"Most importantly, you need to use the -m option to activate the marker API.","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"To list the available performance groups, run likwid-perfctr -a:","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Group name      Description\n--------------------------------------------------------------------------------\n     DATA       Load to store ratio\n FLOPS_DP       Double Precision MFLOP/s\n   BRANCH       Branch prediction miss rate/ratio\n   ENERGY       Power and Energy consumption\nFLOPS_AVX       Packed AVX MFLOP/s\n   DIVIDE       Divide unit information\n FLOPS_SP       Single Precision MFLOP/s\n      TMA       Top down cycle allocation","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"These groups can be passed to the command line option -g.","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Another important option is -C <list>:","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Processor ids to pin threads and measure, e.g. 1,2-4,8. For information about the <list> syntax, see likwid-pin.","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Note that cpu ids start with zero (not one).","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"Combinding the points above, the full command could look like this: likwid-perfctr -C 0 -g FLOPS_DP -m julia.","category":"page"},{"location":"marker/","page":"CPU","title":"CPU","text":"For more information, check out the official documentation.","category":"page"},{"location":"marker/#Functions","page":"CPU","title":"Functions","text":"","category":"section"},{"location":"marker/","page":"CPU","title":"CPU","text":"Modules = [LIKWID.Marker]","category":"page"},{"location":"marker/#LIKWID.Marker.getregion-Tuple{AbstractString}","page":"CPU","title":"LIKWID.Marker.getregion","text":"getregion(regiontag::AbstractString) -> nevents, events, time, count\n\nGet the intermediate results of the region identified by regiontag. On success, it returns     * nevents: the number of events in the current group,     * events: a list with all the aggregated event results,     * time: the measurement time for the region and     * count: the number of calls.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.init_nothreads-Tuple{}","page":"CPU","title":"LIKWID.Marker.init_nothreads","text":"Initialize the Marker API only on the main thread. LIKWID.Marker.threadinit() must be called manually.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.isactive-Tuple{}","page":"CPU","title":"LIKWID.Marker.isactive","text":"Checks whether the Marker API is active, i.e. julia has been started under likwid-perfctr -C ... -g ... -m.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.nextgroup-Tuple{}","page":"CPU","title":"LIKWID.Marker.nextgroup","text":"Switch to the next event set in a round-robin fashion. If you have set only one event set on the command line, this function performs no operation.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.registerregion-Tuple{AbstractString}","page":"CPU","title":"LIKWID.Marker.registerregion","text":"Register a region with name regiontag to the Marker API. On success, true is returned.\n\nThis is an optional function to reduce the overhead of region registration at Marker.startregion. If you don't call registerregion, the registration is done at startregion.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.resetregion-Tuple{AbstractString}","page":"CPU","title":"LIKWID.Marker.resetregion","text":"Reset the values stored using the region name regiontag. On success, true is returned.\n\n\n\n\n\n","category":"method"},{"location":"marker/#LIKWID.Marker.threadinit-Tuple{}","page":"CPU","title":"LIKWID.Marker.threadinit","text":"Add the current thread to the Marker API.\n\n\n\n\n\n","category":"method"},{"location":"#LIKWID-Like-I-Knew-What-I'm-Doing","page":"LIKWID","title":"LIKWID - Like I Knew What I'm Doing","text":"","category":"section"},{"location":"","page":"LIKWID","title":"LIKWID","text":"LIKWID.jl is a Julia wrapper for the performance monitoring and benchmarking suite LIKWID.","category":"page"},{"location":"#Installation","page":"LIKWID","title":"Installation","text":"","category":"section"},{"location":"","page":"LIKWID","title":"LIKWID","text":"Prerequisites:","category":"page"},{"location":"","page":"LIKWID","title":"LIKWID","text":"You must have likwid installed (see the build & install instructions).\nYou must be running Linux. (LIKWID doesn't support macOS or Windows.)","category":"page"},{"location":"","page":"LIKWID","title":"LIKWID","text":"LIKWID.jl is a registered Julia package. Hence, you can simply add it to your Julia environment with the command","category":"page"},{"location":"","page":"LIKWID","title":"LIKWID","text":"] add LIKWID","category":"page"}]
}
