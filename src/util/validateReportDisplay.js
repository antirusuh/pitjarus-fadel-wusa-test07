const yup = require('yup')

let reportDisplay = yup.object().shape({
    id: yup.number().positive('id must be positive').integer('id must be Integer'),
    visit_id: yup.string().max(50, 'Maximum length for visit_id are 50'),
    store_id: yup.number().positive('store_id must be positive').integer('store_id must be Integer'),
    category_id: yup.number().positive('category_id must be positive').integer('category_id must be Integer'),
    json_path: yup.string().url()
})

const validate = (data) => {
    return reportDisplay.validate(data)
}

const validateAsArray = async (listData) => {
    return new Promise((async (resolve, reject) => {
        let castedData = []
        for (let i = 0; i < listData.length; i++) {
            const data = listData[i]
            try {
                const result = await validate(data)
                castedData.push(result)
            } catch (err) {
                reject({
                    status: 400,
                    message: err.errors
                })
            }
        }

        if (castedData.length > 0) {
            resolve(castedData)
        } else {
            reject({
                status: 400,
                message: "Data Not Found"
            })
        }
    }))

}

module.exports = {
    validateAsArray,
    validate
}
