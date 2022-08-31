const axios = require('axios')

const catchAsync = require('../util/catchAsync');
const db = require('../models')
const { countArray } = require('../util/countArray')
const { validateAsArray, validate } = require('../util/validateReportDisplay')

const getVisit = catchAsync(async (req, res) => {
    const {visit_id: visitId} = req.params
    const v = await db.report_display.findAll({
        where: {
            visit_id: visitId
        }
    })

    try {
        const reports = await validateAsArray(v)

        res.status(200).json(reports)
    } catch (err) {
        res.status(err.status).json({
            message: err.message
        })
    }
})

const getReportDisplay = catchAsync(async (req, res) => {
    /** logic here */
    const { visit_id: visitId } = req.query
    let categoryIds = new Set()
    let displays = []

    const generalReport = await db.report_display.findOne({
        where: {
            visit_id: visitId
        },
        attributes: ['visit_id', 'store_id', 'surveyor_id'],
    })

    try {

    } catch (err) {

    }

    const reportByCategory = await db.report_display.findAll({
        where: {
            visit_id: visitId
        },
        attributes: ['category_id']
    })

    reportByCategory.forEach(el => {
        categoryIds.add(el.category_id)
    })

    for (const categoryId of categoryIds) {
        let result = {}
        const category = await db.category.findByPk(categoryId, {
            attributes: ['id', 'name']
        })

        const pathByCategory = await db.report_display.findAll({
            where: {
                visit_id: visitId,
                category_id: category.id
            },
            attributes: [['json_path', 'path']],
            raw: true
        })

        result = {
            category_id: category.id,
            category_name: category.name,
            json_paths: pathByCategory
        }

        displays.push(result)
    }

    const surveyor = await db.surveyor.findOne({
        where: {
            id: generalReport.surveyor_id
        },
        attributes: ['username']
    })

    const store = await db.store.findOne({
        where: {
            id: generalReport.store_id
        },
        attributes: ['name']
    })

    if (generalReport) {
        res.status(200).json({
            visit_id: generalReport.visit_id,
            store_id: generalReport.store_id,
            store_name: store.name,
            surveyor_id: generalReport.surveyor_id,
            surveyor_name: surveyor.username,
            displays
        })
    } else  {
        res.status(404).json({
            message: 'visit not found'
        })
    }

    /* contoh output */
    const expectedOutput = {
        visit_id: "V.26.865.22081208343138",
        store_id: 865,
        store_name: "Toko A",
        surveyor_id: 1,
        surveyor_name: "Surveyor 1",
        displays: [
            {
                category_id: 1,
                category_name: "SKin Care",
                json_paths : [
                    {path: "https://storage2.pitjarus.co/galderma/jsons/20220812/V.26.865.22081208343138_1_1_display1_1.json"},
                    {path: "https://storage2.pitjarus.co/galderma/jsons/20220812/V.26.865.22081208343138_1_1_display1_2.json"}
                ]
            },
            {
                category_id: 2,
                category_name: "SKin Cleansing",
                json_paths : [
                    {path: "https://storage2.pitjarus.co/galderma/jsons/20220812/V.26.865.22081208343138_2_2_display2_1.json"},
                    {path: "https://storage2.pitjarus.co/galderma/jsons/20220812/V.26.865.22081208343138_2_2_display1_1.json"}
                ]
            }
        ]
    }
})

const getReportProduct = catchAsync(async (req, res) => {
    /** logic here */
    const { visit_id: visitId } = req.query
    let listOutput = []
    let products = []
    let setProduct = new Set()

    const reports = await db.report_display.findAll({
        where: {
            visit_id: visitId
        },
        attributes: ['json_path']
    })

    if (reports.length === 0) {
        res.status(400).json({
            message: "Visit id not found"
        })
    }

    for (let i = 0; i < reports.length; i++) {
        const el = reports[i]
        const { data: visitProducts } = await axios.get(el.json_path)
        const productNames = visitProducts.map(el => {
            return el.object_name
        })

        productNames.forEach(el => {
            setProduct.add(el)
        })
        products = [...products, ...productNames]
    }


    for (const productName of setProduct) {
        const product = await db.product.findOne({
            where: {
                name: productName
            },
            attributes: ['id']
        })

        if (product) {
            const total = countArray(productName, products)
            listOutput.push({
                product_id: product.id,
                jumlah: total
            })
        }
    }


    if(reports.length > 0){
        res.status(200).json({
            visit_id: visitId,
            products: listOutput
        })
    }
    else{
        res.status(400).json({
            message: "visit not found"
        })
    }

    /* contoh output */
    const expectedOutput = {
        visit_id: "V.26.865.22081208343138",
        products: [
            {product_id: 1, jumlah: 1},
            {product_id: 2, jumlah: 2},
            {product_id: 3, jumlah: 1},
            {product_id: 5, jumlah: 6},
        ]
    }
})

const batchReportProduct = catchAsync(async (req, res) => {
    /** logic here */
    let { visit_id } = req.query
    let { PORT } = process.env

    const exists = await db.report_product.findOne({
        where: {
            visit_id
        }
    })

    if (exists === null) {
        try {
            let { data:result1 } = await axios.post(`http://localhost:${ PORT }/product-visit?visit_id=${ visit_id }`)
            console.log(result1.visit_id, "<+++++++++")
            let { visit_id:visitId, products } = result1
            const result2 = products.map(el => {
                return {
                    visit_id: visitId,
                    product_id: el.product_id,
                    jumlah_product: el.jumlah
                }
            })

            await db.report_product.bulkCreate(result2, {returning: false})
        } catch (err) {
            const status = err?.response?.status || 500
            const message = err?.response?.data?.message || "Internal server error"
            res.status(status).json({
                message
            })
        }
    }

    res.status(200).json({
        status: "OK",
        message: "batch success"
    })
})



module.exports = {
    getVisit,
    getReportDisplay,
    getReportProduct,
    batchReportProduct
}