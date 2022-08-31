
const countArray = (find, arr) => {
    let count = 0
    arr.forEach(el => {
        if (el === find) {
            count ++
        }
    })

    return count
}

module.exports = { countArray }