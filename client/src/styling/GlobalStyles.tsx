import { createGlobalStyle } from 'styled-components'
import { theme } from './theme'

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans');
  @import url('https://fonts.googleapis.com/css?family=Roboto');

  * {
    box-sizing: border-box;
    color: ${theme.colors.martinique};
  }

  strong {
    font-family: ${theme.fonts.roboto};
    font-weight: bold;
  }

  *:not(strong) {
    font-family: ${theme.fonts.openSans};
  }
`

