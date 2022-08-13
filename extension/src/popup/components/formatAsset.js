import React from 'react'

export default (props) => {
  const { scid, value } = props
  console.log(scid)
  if (!scid || scid === "" || scid === "0000000000000000000000000000000000000000000000000000000000000000") {
    return `${value / 100000} DERO`
  }

  return value
}
