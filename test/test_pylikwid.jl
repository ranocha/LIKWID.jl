# Translation of pylikwid example from https://github.com/RRZE-HPC/pylikwid
using Test
using Printf
using LIKWID

list = Int[]
cpus = [0,1]
@test LIKWID.PerfMon.init(cpus)
group = LIKWID.PerfMon.add_event_set("INSTR_RETIRED_ANY:FIXC0")
@test group == 0
@test LIKWID.PerfMon.setup_counters(group)
@test LIKWID.PerfMon.start_counters()
for i in 1:1_000_000
    push!(list,i)
end
@test LIKWID.PerfMon.stop_counters()
for thread in 1:length(cpus)
    tidx = thread-1
    @printf("Result CPU %d : %f\n", cpus[thread], LIKWID.PerfMon.get_result(group,0,tidx))
end