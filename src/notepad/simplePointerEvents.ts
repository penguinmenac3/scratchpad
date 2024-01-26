export interface SimplePointerEventCallbacks {
    // Mouse
    onMouseStart(ev: PointerEvent, mouseBtn: number): void
    onMouseMove(ev: PointerEvent, mouseBtn: number, previousEvent: PointerEvent): void
    onMouseEnd(ev: PointerEvent, mouseBtn: number, previousEvent: PointerEvent): void

    // Pen
    onPenStart(ev: PointerEvent): void
    onPenMove(ev: PointerEvent, previousEvent: PointerEvent): void
    onPenEnd(ev: PointerEvent, previousEvent: PointerEvent): void

    // Single finger
    onTouchStart(ev: TouchEvent): void
    onTouchMove(ev: TouchEvent, previousEvent: TouchEvent): void
    onTouchEnd(ev: TouchEvent, previousEvent: TouchEvent): void

    // Two fingers
    onPinchStart(ev: TouchEvent): void
    onPinchMove(ev: TouchEvent, previousEvent: TouchEvent): void
    onPinchEnd(ev: TouchEvent, previousEvent: TouchEvent): void
}

export function registerSimplePointerCallbacks(element: HTMLElement, callbacks: SimplePointerEventCallbacks) {
    let previousMouseEvent: PointerEvent = new PointerEvent("mouse")
    let previousPenEvent: PointerEvent = new PointerEvent("pen")
    let previousTouchEvent: TouchEvent = new TouchEvent("touch")
    let isMouseDown: boolean = false
    let mouseBtn: number = 0
    let isPenDown: boolean = false

    element.addEventListener('touchstart', function(ev: TouchEvent) {
        ev.preventDefault()
        if (ev.targetTouches.length == 1) {
            callbacks.onTouchStart(ev)
        }
        if (ev.targetTouches.length == 2) {
            callbacks.onPinchStart(ev)
        }
        previousTouchEvent = ev
    })
    
    element.addEventListener('touchmove', function(ev: TouchEvent) {
        ev.preventDefault()
        if (previousTouchEvent.targetTouches.length == 1) {
            if (ev.targetTouches.length == 1) {
                callbacks.onTouchMove(ev, previousTouchEvent)
            } else {
                callbacks.onTouchEnd(ev, previousTouchEvent)
            }
            if (ev.targetTouches.length == 2) {
                callbacks.onPinchStart(ev)
            }
        }
        if (previousTouchEvent.targetTouches.length == 2) {
            if (ev.targetTouches.length == 2) {
                callbacks.onPinchMove(ev, previousTouchEvent)
            } else {
                callbacks.onPinchEnd(ev, previousTouchEvent)
            }
            if (ev.targetTouches.length == 1) {
                callbacks.onTouchStart(ev)
            }
        }
        previousTouchEvent = ev
    })

    element.addEventListener('touchend', function(ev: TouchEvent) {
        ev.preventDefault()
        if (previousTouchEvent.targetTouches.length == 1) {
            callbacks.onTouchEnd(ev, previousTouchEvent)
        } else if (previousTouchEvent.targetTouches.length == 2) {
            callbacks.onPinchEnd(ev, previousTouchEvent)
        }
        previousTouchEvent = ev
    })

    element.addEventListener('pointerdown', function(ev: PointerEvent) {
        ev.preventDefault()
        if (ev.pointerType == "mouse" && !isMouseDown) {
            isMouseDown = true
            mouseBtn = ev.button
            callbacks.onMouseStart(ev, mouseBtn)
            previousMouseEvent = ev
        } else if (ev.pointerType == "pen" && !isPenDown) {
            isPenDown = true
            callbacks.onPenStart(ev)
            previousPenEvent = ev
        }
    })

    element.addEventListener('pointermove', function(ev: PointerEvent) {
        ev.preventDefault()
        if (ev.pointerType == "mouse" && isMouseDown) {
            callbacks.onMouseMove(ev, mouseBtn, previousMouseEvent)
            previousMouseEvent = ev
        } else if (ev.pointerType == "pen" && isPenDown) {
            callbacks.onPenMove(ev, previousPenEvent)
            previousPenEvent = ev
        }
    })

    element.addEventListener('pointerup', function(ev: PointerEvent) {
        ev.preventDefault()
        if (ev.pointerType == "mouse" && isMouseDown && ev.button == mouseBtn) {
            callbacks.onMouseEnd(ev, mouseBtn, previousMouseEvent)
            isMouseDown = false
            previousMouseEvent = ev
        } else if (ev.pointerType == "pen" && isPenDown) {
            callbacks.onPenEnd(ev, previousPenEvent)
            isPenDown = false
            previousPenEvent = ev
        }
    })
}
