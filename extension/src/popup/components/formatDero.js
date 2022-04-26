import React from 'react'

export default (props) => {
  const { value } = props
  return <>{value / 100000} DERO</>
}
