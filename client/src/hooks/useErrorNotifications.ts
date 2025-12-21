import { useState, useCallback } from 'react'

export const useErrorNotifications = (timeout: number = 4000) => {
  const [errorList, setErrorList] = useState<string[]>([])

  const removeError = useCallback((removableErrorMessage: string) => {
    setErrorList(prevErrors =>
      prevErrors.filter(errorMessage => errorMessage !== removableErrorMessage)
    )
  }, [])

  const addErrorMessage = useCallback((errorMessage: string) => {
    setErrorList(prevErrors => [...prevErrors, errorMessage])
    setTimeout(() => {
      removeError(errorMessage)
    }, timeout)
  }, [removeError, timeout])

  return { errorList, addErrorMessage }
}

