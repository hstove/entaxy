import React from 'react'
import { compose } from 'recompose'
import { connect } from 'react-redux'
import { withStyles } from '@material-ui/core/styles'
import { withFormik } from 'formik'
import * as Yup from 'yup'
import PropTypes from 'prop-types'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import Divider from '@material-ui/core/Divider'
import Button from '@material-ui/core/Button'
import red from '@material-ui/core/colors/red'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import currencies, { filteredCurrencies } from '../../data/currencies'
import AutoComplete from '../../common/AutoComplete'
import { sortedInstitutionsForAutoselect } from '../../store/accounts/selectors'
import SubmitButtonWithProgress from '../../common/SubmitButtonWithProgress'

const styles = theme => ({
  root: {
    margin: theme.spacing.unit * 2,
    padding: theme.spacing.unit * 2
  },
  formHeader: {
    padding: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  closeButton: {
    marginTop: -10
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    margin: theme.spacing.unit * 2,
    width: 320
  },
  inputTitle: {
    marginLeft: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2,
    marginBottom: -theme.spacing.unit * 2
  },
  inputError: {
    marginTop: -7,
    marginLeft: theme.spacing.unit * 2
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: 10
  },
  deleteButton: {
    color: red[500],
    margin: theme.spacing.unit * 2
  }
})

const mapStateToProps = (state, ownProps) => {
  return {
    settings: state.settings,
    account: state.accounts.byId[ownProps.accountId],
    institutions: sortedInstitutionsForAutoselect()
  }
}

export const AccountFormComponent = ({
  classes,
  institutions,
  handleSubmit,
  isSubmitting,
  values,
  errors,
  touched,
  handleChange,
  setFieldValue,
  handleDelete,
  handleCancel,
  account
}) => (
  <Grid container direction="row" justify="center">
    <Paper className={classes.root}>
      <div className={classes.formHeader}>
        <Typography variant="h6" align="center">
          {account ? 'Edit account' : 'New account'}
        </Typography>
        <IconButton aria-label="Close" className={classes.closeButton} onClick={handleCancel}>
          <CloseIcon />
        </IconButton>
      </div>
      <Divider />
      <form onSubmit={handleSubmit} className={classes.form}>
        <TextField
          className={classes.input}
          label="Account name"
          inputProps={{
            'aria-label': 'Account name',
            maxLength: 100
          }}
          value={values.name}
          name="name"
          onChange={handleChange}
          error={errors.name && touched.name}
          helperText={errors.name}
          autoFocus
        />
        <AutoComplete
          className={classes.input}
          label="Institution"
          name="institution"
          value={values.institution}
          options={institutions}
          onChange={setFieldValue}
          error={errors.institution && touched.institution}
          helperText={errors.institution}
        />
        <TextField
          className={classes.input}
          type="number"
          label="Opening balance"
          inputProps={{
            'aria-label': 'Opening balance',
            maxLength: 10,
            min: Number.MIN_SAFE_INTEGER,
            max: Number.MAX_SAFE_INTEGER,
            step: 0.01
          }}
          value={values.openingBalance}
          name="openingBalance"
          onChange={handleChange}
          error={errors.openingBalance && touched.openingBalance}
          helperText={errors.openingBalance}
        />
        <TextField
          type="date"
          label="Opening Balance Date"
          InputLabelProps={{
            shrink: true,
            'aria-label': 'Opening Balance Date'
          }}
          name="openingBalanceDate"
          className={classes.input}
          value={values.openingBalanceDate}
          onChange={handleChange}
          error={errors.openingBalanceDate && touched.openingBalanceDate}
          helperText={errors.openingBalanceDate}
        />
        <AutoComplete
          async
          className={classes.input}
          label="Display Currency"
          name="currency"
          value={values.currency}
          loadOptions={filteredCurrencies}
          onChange={setFieldValue}
          error={errors.currency && touched.currency}
          helperText={errors.currency}
        />
        {handleDelete &&
          <Button
            size="small"
            onClick={() => handleDelete(account)}
            className={classes.deleteButton}
            disabled={isSubmitting}
          >
            Delete this account
          </Button>
        }
        <Divider />
        <div className={classes.formActions}>
          <SubmitButtonWithProgress label="Save" isSubmitting={isSubmitting} />
        </div>
      </form>
    </Paper>
  </Grid>
)

AccountFormComponent.propTypes = {
  classes: PropTypes.object.isRequired,
  institutions: PropTypes.array.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  values: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  touched: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  handleCancel: PropTypes.func.isRequired,
  account: PropTypes.object
}

AccountFormComponent.defaultProps = {
  handleDelete: null,
  account: null
}

export default compose(
  connect(mapStateToProps),
  withStyles(styles),
  withFormik({
    enableReinitialize: true,
    mapPropsToValues: ({ account, settings }) => {
      if (account === undefined) {
        return {
          name: '',
          institution: null,
          openingBalance: 0,
          openingBalanceDate: format(Date.now(), 'YYYY-MM-DD'),
          currency: settings.currency === undefined ? '' : {
            label: `(${settings.currency}) ${currencies[settings.currency]}`,
            value: settings.currency
          }
        }
      }
      return {
        ...account,
        openingBalanceDate: format(new Date(account.openingBalanceDate), 'YYYY-MM-DD'),
        institution: {
          label: account.institution,
          value: account.institution
        },
        currency: {
          label: `(${account.currency}) ${currencies[account.currency]}`,
          value: account.currency
        }
      }
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .max(100, 'Too Long!')
        .required('Please enter a name for this account'),
      institution: Yup.object()
        .required('Please select an institution')
        .nullable(),
      openingBalance: Yup.number()
        .required('Please enter an opening balance'),
      openingBalanceDate: Yup.number()
        .required('Please select the date of the opening balance'),
      currency: Yup.object()
        .required('Please select the currency of this account')
        .nullable()
    }),
    handleSubmit: (values, { props, setSubmitting }) => {
      setSubmitting(true)
      props.handleSave({
        ...values,
        institution: values.institution.value,
        openingBalanceDate: parse(values.openingBalanceDate).getTime(),
        currency: values.currency.value
      })
    }
  })
)(AccountFormComponent)
