// delay between turning off one output and turning on the other
let SAFETY_DELAY = 1000;
let safety_timer_handle = null;

let TIMER_REPEAT = {
    FALSE: false
};
let SWITCH_ID = {
    LOW: 0,
    HIGH: 1
};

let set_low_off = function() {
    Shelly.call("switch.set", {
        id: SWITCH_ID.LOW,
        on: false
    });
}

let set_high_off = function() {
    Shelly.call("switch.set", {
        id: SWITCH_ID.HIGH,
        on: false
    });
}

/*
For safety reasons the functions `set_low_on` and `set_low_off` double check
that the other output is turned off before turning the own output on.
Turning on both outputs at the same time could be fatal for the ventilation system.
*/
let set_low_on = function() {
    Shelly.call("switch.getStatus", {
        id: SWITCH_ID.HIGH
    }, function(switch_status) {
        if (switch_status.output === true) {
            return;
        }
        Shelly.call("switch.set", {
            id: SWITCH_ID.LOW,
            on: true
        });
    });
}

let set_high_on = function() {
    Shelly.call("switch.getStatus", {
        id: SWITCH_ID.LOW
    }, function(switch_status) {
        if (switch_status.output === true) {
            return;
        }
        Shelly.call("switch.set", {
            id: SWITCH_ID.HIGH,
            on: true
        });
    });
}

let clear_safety_timer = function() {
    if (!!safety_timer_handle) {
        Timer.clear(safety_timer_handle);
    }
}

let set_ventilation_off = function() {
    set_low_off();
    set_high_off();
}

let set_ventilation_low = function() {
    clear_safety_timer();
    set_high_off();
    safety_timer_handle = Timer.set(
        SAFETY_DELAY,
        TIMER_REPEAT.FALSE,
        set_low_on
    );
}

let set_ventilation_high = function() {
    clear_safety_timer();
    set_low_off();
    safety_timer_handle = Timer.set(
        SAFETY_DELAY,
        TIMER_REPEAT.FALSE,
        set_high_on
    );
}

Shelly.addEventHandler(
    function(event) {
        if (!event.info) {
            return;
        }
        if (event.info.event === 'btn_up') {
            set_ventilation_off();
        } else if (event.info.id === SWITCH_ID.LOW && event.info.event === 'btn_down') {
            set_ventilation_low();
        } else if (event.info.id === SWITCH_ID.HIGH && event.info.event === 'btn_down') {
            set_ventilation_high();
        }
    }
)

function fromEntries(entries) {
    let res = {};
    for (let i = 0; i < entries.length; i++) res[entries[i][0]] = entries[i][1];
    return res;
}
if (!Object.fromEntries) Object.fromEntries = fromEntries;

HTTPServer.registerEndpoint("set", function(request, response, userdata) {
    let params = Object.fromEntries(
        request.query.split("&").map(function(kv) {
            return kv.split("=")
        })
    )
    switch (params["mode"]) {
        case "off":
            set_ventilation_off();
            break;
        case "low":
            set_ventilation_low();
            break;
        case "high":
            set_ventilation_high();
            break;
    }
    response.code = 204;
    response.send()
})
