function init_perfmon(cpus::AbstractVector{Int32})
    perfmon_initialized[] && finalize_perfmon()

    if !topo_initialized[]
        init_topology() || error("Couldn't init topology.")
    end
    if !numa_initialized[]
        init_numa() || error("Couldn't init numa.")
    end

    nrThreads = length(cpus)
    ret = LibLikwid.perfmon_init(nrThreads, cpus)
    if ret == 0
        perfmon_initialized[] = true
        timer_initialized[] = true
        return true
    end
    return false
end

init_perfmon(cpus::AbstractVector{<:Integer}) = init_perfmon(convert(Vector{Int32}, cpus))

function finalize_perfmon()
    LibLikwid.perfmon_finalize()
    perfmon_initialized[] = false
    return nothing
end

_check_groupid(gid) = 0 ≤ gid < get_number_of_groups()
_check_eventidx(gid, eidx) = 0 ≤ eidx < get_number_of_events(gid)
_check_metricidx(gid, eidx) = 0 ≤ eidx < get_number_of_metrics(gid)
_check_threadidx(tidx) = 0 ≤ tidx < get_number_of_threads()

"""
Return the number of threads initialized in the perfmon module.
"""
get_number_of_threads() = LibLikwid.perfmon_getNumberOfThreads()

"""
Return the number of groups currently registered in the perfmon module.
"""
get_number_of_groups() = LibLikwid.perfmon_getNumberOfGroups()

"""
Return the amount of events in the group.
"""
get_number_of_events(groupid::Integer) = LibLikwid.perfmon_getNumberOfEvents(groupid)

"""
Return the amount of metrics in the group.
Always zero for custom event sets.
"""
get_number_of_metrics(groupid::Integer) = LibLikwid.perfmon_getNumberOfMetrics(groupid)

"""
Return a list of all available perfmon groups.
"""
function get_groups()
    if !topo_initialized[]
        init_topology() || error("Couldn't init topology.")
    end
    # refs to char**
    groups_ref = Ref{Ptr{Ptr{Cchar}}}()
    shorts_ref = Ref{Ptr{Ptr{Cchar}}}()
    longs_ref = Ref{Ptr{Ptr{Cchar}}}()

    ret = LibLikwid.perfmon_getGroups(groups_ref, shorts_ref, longs_ref)
    ret <= 0 && return nothing

    groups_vec = unsafe_wrap(Array, groups_ref[], ret)
    shorts_vec = unsafe_wrap(Array, shorts_ref[], ret)
    longs_vec = unsafe_wrap(Array, longs_ref[], ret)
    res = Vector{GroupInfoCompact}(undef, ret)
    for i in 1:ret
        res[i] = GroupInfoCompact(
            unsafe_string(groups_vec[i]),
            unsafe_string(shorts_vec[i]),
            unsafe_string(longs_vec[i]),
        )
    end
    LibLikwid.perfmon_returnGroups(ret, groups_ref[], shorts_ref[], longs_ref[])
    return res
end

"""
    add_event_set(estr) -> groupid
Add a performance group or a custom event set to the perfmon module.
Returns a `groupid` which is required to later specify the event set.
"""
function add_event_set(estr::AbstractString)
    perfmon_initialized[] || return nothing
    groupid = LibLikwid.perfmon_addEventSet(estr)
    return groupid
end

"""
Return the name of the group identified by `groupid`.
If it is a custom event set, the name is set to `Custom`.
"""
function get_name_of_group(groupid::Integer)
    perfmon_initialized[] || return nothing
    _check_groupid(groupid) || return nothing
    name = unsafe_string(LibLikwid.perfmon_getGroupName(groupid))
    return name
end

"""
Return the short information about a performance group.
"""
function get_shortinfo_of_group(groupid::Integer)
    perfmon_initialized[] || return nothing
    _check_groupid(groupid) || return nothing
    sinfo = unsafe_string(LibLikwid.perfmon_getGroupInfoShort(groupid))
    return sinfo
end

"""
Return the (long) description of a performance group.
"""
function get_longinfo_of_group(groupid::Integer)
    perfmon_initialized[] || return nothing
    _check_groupid(groupid) || return nothing
    linfo = unsafe_string(LibLikwid.perfmon_getGroupInfoLong(groupid))
    return linfo
end

"""
Return the name of the event identified by `groupid` and `eventidx`.
"""
function get_name_of_event(groupid::Integer, eventidx::Integer)
    if !perfmon_initialized[] ||
       !_check_groupid(groupid) ||
       !_check_eventidx(groupid, eventidx)
        return nothing
    end
    name = unsafe_string(LibLikwid.perfmon_getEventName(groupid, eventidx))
    return name
end

"""
Return the name of the counter register identified by `groupid` and `eventidx`.
"""
function get_name_of_counter(groupid::Integer, eventidx::Integer)
    if !perfmon_initialized[] ||
       !_check_groupid(groupid) ||
       !_check_eventidx(groupid, eventidx)
        return nothing
    end
    name = unsafe_string(LibLikwid.perfmon_getCounterName(groupid, eventidx))
    return name
end

"""
Return the name of a derived metric identified by `groupid` and `metricidx`.
"""
function get_name_of_metric(groupid::Integer, metricidx::Integer)
    if !perfmon_initialized[] ||
       !_check_groupid(groupid) ||
       !_check_metricidx(groupid, metricidx)
        return nothing
    end
    name = unsafe_string(LibLikwid.perfmon_getMetricName(groupid, metricidx))
    return name
end

"""
Program the counter registers to measure all events in group `groupid`. Returns `true` on success.
"""
function setup_counters(groupid::Integer)
    perfmon_initialized[] || return nothing
    _check_groupid(groupid) || return false
    ret = LibLikwid.perfmon_setupCounters(groupid)
    return ret == 0
end

"""
Start the counter registers. Returns `true` on success.
"""
function start_counters()
    perfmon_initialized[] || return nothing
    ret = LibLikwid.perfmon_startCounters()
    return ret == 0
end

"""
Stop the counter registers. Returns `true` on success.
"""
function stop_counters()
    perfmon_initialized[] || return nothing
    ret = LibLikwid.perfmon_stopCounters()
    return ret == 0
end

"""
Read the counter registers.
To be executed after `start_counters` and before `stop_counters`.
Returns `true` on success.
"""
function read_counters()
    perfmon_initialized[] || return nothing
    ret = LibLikwid.perfmon_readCounters()
    return ret == 0
end

"""
Return the `groupid` of the currently activate group.
"""
function get_id_of_active_group()
    perfmon_initialized[] || return nothing
    return LibLikwid.perfmon_getIdOfActiveGroup()
end

"""
Switch currently active group to `groupid`. Returns `true` on success.
"""
function switch_group(groupid::Integer)
    perfmon_initialized[] || return nothing
    _check_groupid(groupid) || return nothing
    groupid == get_id_of_active_group() && return true
    ret = LibLikwid.perfmon_switchActiveGroup(groupid)
    return ret == 0
end

function get_last_result(groupid::Integer, eventidx::Integer, threadidx::Integer)
    perfmon_initialized[] || return nothing
    _check_eventidx(groupid, eventidx) || return nothing
    _check_threadidx(threadidx) || return nothing
    res = LibLikwid.perfmon_getLastResult(groupid, eventidx, threadidx)
    return res
end