var {
  SECRET,
  EXPIRES
} = process.env

module.exports = {
  secret: SECRET || 'CYKTKkbmYqm9QroNpEpG9cpd8ThuVh',
  expires: EXPIRES || 8640000 // 100 days
}
