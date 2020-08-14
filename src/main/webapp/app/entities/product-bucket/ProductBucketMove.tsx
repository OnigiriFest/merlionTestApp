import React, { useEffect, useState, useRef } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, TextField, Grid } from '@material-ui/core';
import { ValidatorForm, TextValidator } from 'react-material-ui-form-validator';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { connect } from 'react-redux';

import { IRootState } from 'app/shared/reducers';
import { getEntities as getBucketProducts, updateProductBucketQuantity } from './product-bucket.reducer';

export interface IProductBucketProps extends StateProps, DispatchProps {}

const ProductBucketMove = (props: IProductBucketProps) => {
  const [productSelected, setProductSelected] = useState(null);
  const [from, setFrom] = useState('Disponible');
  const [to, setTo] = useState('Vendido');
  const [quantiy, setQuantity] = useState('');
  const [toOptions, setToOptions] = useState(['Vendido', 'Roto']);

  const quantityInput = useRef(null);

  useEffect(() => {
    props.getBucketProducts();
  }, []);

  const renderProductBucket = () => {
    return props.productBucketList.map(productBucket => {
      return (
        <TableRow key={productBucket.id}>
          <TableCell>{productBucket.id}</TableCell>
          <TableCell>{productBucket.availableToSellQuantity}</TableCell>
          <TableCell>{productBucket.inChargeQuantity}</TableCell>
          <TableCell>{productBucket.brokenQuantity}</TableCell>
          <TableCell>{productBucket.product && productBucket.product.name}</TableCell>
          <TableCell>
            <Button onClick={() => setProductSelected({ ...productBucket })} color="primary" variant="contained" size="small">
              Seleccionar
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  const onChangeFrom = (e, newValue) => {
    setFrom(newValue);
    let options;

    switch (newValue) {
      case 'Disponible':
        options = ['Vendido', 'Roto'];
        setTo('Vendido');
        break;
      case 'Vendido':
        options = ['Disponible', 'Roto'];
        setTo('Disponible');
        break;
      case 'Roto':
        options = ['Disponible', 'Vendido'];
        setTo('Disponible');
        break;
      default:
        break;
    }

    setToOptions(options);
  };

  const getQuantity = () => {
    switch (from) {
      case 'Disponible':
        return 'availableToSellQuantity';
      case 'Vendido':
        return 'inChargeQuantity';
      case 'Roto':
        return 'brokenQuantity';
      default:
        break;
    }
  };

  const onSubmit = e => {
    let available = productSelected.availableToSellQuantity;
    let broken = productSelected.brokenQuantity;
    let inCharge = productSelected.inChargeQuantity;

    switch (from) {
      case 'Disponible':
        available -= Number(quantiy);
        if (to === 'Vendido') {
          inCharge += Number(quantiy);
        } else {
          broken += Number(quantiy);
        }
        break;
      case 'Vendido':
        inCharge -= Number(quantiy);
        if (to === 'Disponible') {
          available += Number(quantiy);
        } else {
          broken += Number(quantiy);
        }
        break;
      case 'Roto':
        broken -= Number(quantiy);
        if (to === 'Disponible') {
          available += Number(quantiy);
        } else {
          inCharge += Number(quantiy);
        }
        break;
      default:
        return;
    }

    // eslint-disable-next-line no-console
    console.log(`${available}, ${inCharge}`);

    props.updateProductBucketQuantity({
      ...productSelected,
      availableToSellQuantity: available,
      brokenQuantity: broken,
      inChargeQuantity: inCharge,
    });

    setProductSelected(null);
  };

  return (
    <div>
      <div>
        {productSelected !== null ? (
          <ValidatorForm onSubmit={e => onSubmit(e)}>
            <Grid container alignItems="center" justify="center" spacing={2}>
              <Grid item xs={1}>
                Mover
              </Grid>
              <Grid item xs={2}>
                {productSelected.product.name}
              </Grid>
              <Grid item xs={2}>
                <Autocomplete
                  value={from}
                  onChange={(e: any, newValue: string) => onChangeFrom(e, newValue)}
                  options={['Disponible', 'Vendido', 'Roto']}
                  renderInput={params => <TextField {...params} label="Desde" size="small" variant="standard" />}
                />
              </Grid>
              <Grid item xs={2}>
                <Autocomplete
                  value={to}
                  onChange={(e: any, newValue: string) => setTo(newValue)}
                  options={toOptions}
                  renderInput={params => <TextField {...params} label="A" size="small" variant="standard" />}
                />
              </Grid>
              <Grid item xs={2}>
                <TextValidator
                  validators={['required', 'minNumber:1', `maxNumber:${productSelected[getQuantity()]}`, 'matchRegexp:^[0-9]+$']}
                  ref={quantityInput}
                  value={quantiy}
                  onChange={e => setQuantity(e.target.value)}
                  size="small"
                  label="Cantidad"
                />
              </Grid>
              <Button type="submit" color="secondary" variant="contained" size="small">
                Mover
              </Button>
            </Grid>
          </ValidatorForm>
        ) : null}
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Disponible</TableCell>
            <TableCell>Vendido</TableCell>
            <TableCell>Roto</TableCell>
            <TableCell>Producto</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderProductBucket()}</TableBody>
      </Table>
    </div>
  );
};

const mapStateToProps = ({ productBucket }: IRootState) => ({
  productBucketList: productBucket.entities,
  loading: productBucket.loading,
});

const mapDispatchToProps = {
  getBucketProducts,
  updateProductBucketQuantity,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProductBucketMove);
