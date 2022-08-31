const yup = require('yup')

let reportDisplay = yup.object().shape({
    id: yup.number().positive('id must be positive').integer('id must be Integer'),
    visit_id: yup.string().max(50, 'Maximum length for visit_id are 50'),
    store_id: yup.number().positive('store_id must be positive').integer('store_id must be Integer'),
    category_id: yup.number().positive('category_id must be positive').integer('category_id must be Integer'),
    json_path: yup.string().url()
})

let visitId = yup
    .string()
    .max(50, 'Maximum length of visit_id are 50')
    .test({
        name: 'initalV',
        exclusive: false,
        message: 'visit_id Must start with "V"',
        test: (value) => value.slice(0, 1) === "V"
    })
    .test({
        name: 'have3Dots',
        exclusive: false,
        message: 'visit_id Must have three dots',
        test: (value) => {
            let a = value.match(/\./g)
            if (a) {
                return a.length === 3
            } else {
                return false
            }
        }
    })

const validateVisitId = (data) => {
    return visitId.validate(data)
}

const validateReportDisplay = (data) => {
    return reportDisplay.validate(data)
}

const validateReportDisplayAsArray = async (listData) => {
    return new Promise((async (resolve, reject) => {
        let castedData = []
        for (let i = 0; i < listData.length; i++) {
            const data = listData[i]
            try {
                const result = await validateReportDisplay(data)
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
    validateVisitId
}
