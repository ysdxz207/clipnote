export default (Vue) => {
    Vue.directive('drag', {
        inserted: function (target) {
            target.onmousedown = function (ev) {
                let disX = ev.offsetX
                let disY = ev.offsetY
                document.onmousemove = function (eve) {
                    eve.target.classList.add('draging')
                    target.style.left = eve.clientX - disX + 'px'
                    target.style.top = eve.clientY - disY + 'px'
                }
                document.onmouseup = function (e) {
                    document.onmousemove = document.onmouseup = null
                    setTimeout(function () {
                        e.target.classList.remove('draging')
                    }, 500)
                }
                return false
            }
        }
    })
}
