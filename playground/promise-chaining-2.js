require('../src/db/mongoose')
const Task = require('../src/models/task')

const _id = '5e6c9a97e5201829a4a432d9'

// Task.findByIdAndDelete(_id).then((task) => {
//     console.log(task)

//     return Task.countDocuments({ completed: false })
// }).then((result) => {
//     console.log(result)
// }).catch((err) => {
//     console.log(err)
// })

const deleteTaskAndCount = async (id) => {
    const task = await Task.findOneAndDelete(_id)
    const count = await Task.countDocuments({ completed: false })
    return count
}

deleteTaskAndCount()
    .then((count) => {
        console.log(count)
    })
    .catch((err) => {
        console.log(err)
    })
