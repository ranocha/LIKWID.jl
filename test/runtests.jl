using Test
using LIKWID

@testset "Topology" begin
    @test LIKWID.init_topology()
    cputopo = LIKWID.get_cpu_topology()
    @test typeof(cputopo) == LIKWID.CpuTopology
    cpuinfo = LIKWID.get_cpu_info()
    @test typeof(cpuinfo) == LIKWID.CpuInfo
    @test isnothing(LIKWID.print_supported_cpus())
    @test isnothing(LIKWID.finalize_topology())
end

@testset "NUMA" begin
    @test LIKWID.init_numa()
    numinfo = LIKWID.get_numa_topology()
    @test typeof(numinfo) == LIKWID.NumaTopology
    @test numinfo.numberOfNodes ≥ 1
    numanode = first(numinfo.nodes)
    @test typeof(numanode) == LIKWID.NumaNode
    @test numanode.totalMemory ≥ 0
    @test numanode.numberOfProcessors ≥ 1
    @test typeof(numanode.processors) == Vector{Int}
    @test length(numanode.processors) == numanode.numberOfProcessors
    @test isnothing(LIKWID.finalize_numa())
end

@testset "Affinity" begin
    @test LIKWID.init_affinity()
    affinity = LIKWID.get_affinity()
    @test typeof(affinity) == LIKWID.AffinityDomains
    @test affinity.numberOfSocketDomains ≥ 1
    @test affinity.numberOfNumaDomains ≥ 1
    @test affinity.numberOfProcessorsPerSocket ≥ 1
    @test affinity.numberOfAffinityDomains ≥ 1
    @test typeof(affinity.domains) == Vector{LIKWID.AffinityDomain}
    @test length(affinity.domains) == affinity.numberOfAffinityDomains
    d = first(affinity.domains)
    @test typeof(d) == LIKWID.AffinityDomain
    @test typeof(d.tag) == String
    @test typeof(d.processorList) == Vector{Int}
    @test length(d.processorList) == d.numberOfProcessors
    @test isnothing(LIKWID.finalize_affinity())
end

@testset "Timer" begin
    @test LIKWID.init_timer()
    @test isinteger(LIKWID.get_cpu_clock())
    @test isinteger(LIKWID.get_cpu_clock_current(0))
    t = LIKWID.start_clock()
    @test !isnothing(t)
    @test !iszero(t.start)
    @test iszero(t.stop)
    t = LIKWID.stop_clock(t)
    @test !iszero(t.start)
    @test !iszero(t.stop)
    @test typeof(LIKWID.get_clock(t)) == Float64
    @test isinteger(LIKWID.get_clock_cycles(t))
    @test isnothing(LIKWID.finalize_timer())
end

@testset "Thermal" begin
    @test LIKWID.init_thermal(0)
    @test isinteger(LIKWID.read_thermal(0))
end

@testset "Power / Energy" begin
    @test LIKWID.init_power(0)
    @test isnothing(LIKWID.finalize_power())
    @test LIKWID.init_power()
    pinfo = LIKWID.get_power_info()
    @test typeof(pinfo) == LIKWID.PowerInfo
    @test typeof(pinfo.turbo) == LIKWID.TurboBoost
    @test pinfo.turbo.numSteps == length(pinfo.turbo.steps)
    @test length(pinfo.domains) == 5
    pd = pinfo.domains[1]
    @test typeof(pd) == LIKWID.PowerDomain
    @test isinteger(pd.id)
    @test 0 ≤ pd.id ≤ 4
    @test 0 ≤ Int(pd.type) ≤ 4
    @test typeof(pd.supportInfo) == Bool
    @test typeof(pd.supportStatus) == Bool
    @test typeof(pd.supportPerf) == Bool
    @test typeof(pd.supportPolicy) == Bool
    @test typeof(pd.supportLimit) == Bool
    @test isnothing(LIKWID.finalize_power())
end

@testset "Configuration" begin
    @test LIKWID.init_configuration()
    config = LIKWID.get_configuration()
    @test typeof(config) == LIKWID.Likwid_Configuration
    @test typeof(config.daemonMode) == LIKWID.LibLikwid.AccessMode
    @test Int(config.daemonMode) in (-1, 0, 1)
    @test LIKWID.destroy_configuration()
end

@testset "Access / HPM" begin
    @test LIKWID.hpmmode(0)
    @test LIKWID.hpmmode(LIKWID.LibLikwid.ACCESSMODE_DIRECT)
    @test LIKWID.init_hpm()
    @test typeof(LIKWID.hpm_add_thread(0)) == Int
    # @test LIKWID.hpm_add_thread(0) != -1
    @test isnothing(LIKWID.finalize_hpm())
end

@testset "PerfMon" begin
    @test_throws MethodError LIKWID.init_perfmon()
    @test LIKWID.init_perfmon([0])
    @test LIKWID.get_number_of_threads() == 1
    @test LIKWID.get_number_of_groups() == 0
    groups = LIKWID.get_groups()
    @test typeof(groups) == Vector{LIKWID.GroupInfoCompact}
    gname = groups[1].name
    gsinfo = groups[1].shortinfo
    glinfo = groups[1].longinfo
    # single group
    gid = LIKWID.add_event_set(gname)
    @test gid ≥ 0
    @test LIKWID.get_number_of_groups() == 1
    @test LIKWID.get_name_of_group(gid) == gname
    @test LIKWID.get_shortinfo_of_group(gid) == gsinfo
    @test strip(LIKWID.get_longinfo_of_group(gid)) == strip(glinfo)
    @test LIKWID.get_number_of_events(gid) ≥ 0
    @test LIKWID.get_number_of_metrics(gid) ≥ 0
    nevents = LIKWID.get_number_of_events(gid)
    @test isnothing(LIKWID.get_name_of_event(gid, -1))
    @test isnothing(LIKWID.get_name_of_event(gid, nevents))
    @test isnothing(LIKWID.get_name_of_event(gid, nevents+1))
    @test !isnothing(LIKWID.get_name_of_event(gid, 0))
    @test isnothing(LIKWID.get_name_of_counter(gid, -1))
    @test isnothing(LIKWID.get_name_of_counter(gid, nevents))
    @test !isnothing(LIKWID.get_name_of_counter(gid, 0))
    nmetrics = LIKWID.get_number_of_metrics(gid)
    @test isnothing(LIKWID.get_name_of_metric(gid, -1))
    @test isnothing(LIKWID.get_name_of_metric(gid, nmetrics))
    @test !isnothing(LIKWID.get_name_of_metric(gid, 0))

    @test LIKWID.setup_counters(gid)
    @test LIKWID.get_id_of_active_group() == gid
    @test !LIKWID.read_counters()
    @test LIKWID.start_counters()
    @test LIKWID.read_counters()
    @test LIKWID.read_counters()
    @test LIKWID.stop_counters()
    @test typeof(LIKWID.get_result(gid, 0, 0)) == Float64
    @test typeof(LIKWID.get_last_result(gid, 0, 0)) == Float64
    
    # multiple groups
    gid2 = LIKWID.add_event_set(groups[2].name)
    @test LIKWID.start_counters()
    @test LIKWID.get_id_of_active_group() == gid
    @test LIKWID.read_counters()
    @test LIKWID.switch_group(gid2)
    @test LIKWID.read_counters()
    @test LIKWID.get_id_of_active_group() == gid2
    @test LIKWID.switch_group(gid)
    @test LIKWID.get_id_of_active_group() == gid
    @test LIKWID.stop_counters()

    
end

const perfctr = `likwid-perfctr`
const julia = Base.julia_cmd()
const testdir = @__DIR__
const pkgdir = joinpath(@__DIR__, "..")

# On GitHub runners, FLOPS_SP doesn't seem to work...
const perfgrp = haskey(ENV, "GITHUB_ACTIONS") ? "MEM" : "FLOPS_SP"

@testset "Marker API (CPU)" begin
    @testset "$f" for f in ["test_marker.jl"]
        # without marker api
        run(`$julia --project=$(pkgdir) $(joinpath(testdir, f))`)
        @test true
        # with marker api
        run(`$perfctr -C 0 -g $(perfgrp) -m $julia --project=$(pkgdir) $(joinpath(testdir, f))`)
        @test true
    end
end