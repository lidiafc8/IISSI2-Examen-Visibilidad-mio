import { check } from 'express-validator'
import { Restaurant } from '../../models/models.js'
import { checkFileIsImage, checkFileMaxSize } from './FileValidationHelper.js'

const maxFileSize = 2000000 // around 2Mb

const checkRestaurantExists = async (value, { req }) => {
  try {
    const restaurant = await Restaurant.findByPk(req.body.restaurantId)
    if (restaurant === null) {
      return Promise.reject(new Error('The restaurantId does not exist.'))
    } else { return Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// solucion
const checkVisibleUntilDate = async (value, { req }) => {
  try {
    const fechaActual = new Date()
    if (value !== null && value < fechaActual) {
      return Promise.reject(new Error(` ${value} -The visibility must finish after the current date.`))
    } else if (value >= fechaActual) { Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

// solucion
const checkAvailabilityCompatibility = async (value, { req }) => {
  try {
    const fecha = req.body.visibleUntil
    if (fecha !== null && value === false) {
      return Promise.reject(new Error(` ${value} -Cannot set de availability and visibility at the same time.`))
    } else { Promise.resolve() }
  } catch (err) {
    return Promise.reject(new Error(err))
  }
}

const create = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }).trim(),
  check('description').optional({ checkNull: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  // solucion
  check('availability').custom(checkAvailabilityCompatibility),
  check('visibleUntil').default(null).optional({ nullable: true }).isDate().toDate(),
  check('visibleUntil').custom(checkVisibleUntilDate),

  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').custom(checkRestaurantExists),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB')
]

const update = [
  check('name').exists().isString().isLength({ min: 1, max: 255 }),
  check('description').optional({ nullable: true, checkFalsy: true }).isString().isLength({ min: 1 }).trim(),
  check('price').exists().isFloat({ min: 0 }).toFloat(),
  check('order').default(null).optional({ nullable: true }).isInt().toInt(),
  check('availability').optional().isBoolean().toBoolean(),
  // solucion
  check('availability').custom(checkAvailabilityCompatibility),
  check('visibleUntil').default(null).optional({ nullable: true }).isDate().toDate(),
  check('visibleUntil').custom(checkVisibleUntilDate),

  check('productCategoryId').exists().isInt({ min: 1 }).toInt(),
  check('restaurantId').not().exists(),
  check('image').custom((value, { req }) => {
    return checkFileIsImage(req, 'image')
  }).withMessage('Please upload an image with format (jpeg, png).'),
  check('image').custom((value, { req }) => {
    return checkFileMaxSize(req, 'image', maxFileSize)
  }).withMessage('Maximum file size of ' + maxFileSize / 1000000 + 'MB'),
  check('restaurantId').not().exists()
]

export { create, update }
