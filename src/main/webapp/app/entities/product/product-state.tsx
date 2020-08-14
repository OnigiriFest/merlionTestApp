import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, Button, AppBar, Tabs, Tab, Container } from '@material-ui/core';
import { IRootState } from 'app/shared/reducers';
import { connect } from 'react-redux';

import { State } from '../../shared/model/enumerations/state.model';
import { getEntities as getSales, updateEntityState as updateSale } from '../sales/sales.reducer';

export interface IProductProps extends StateProps, DispatchProps {}

export const ProductState = (props: IProductProps) => {
  const [tab, setTab] = useState('IN_CHARGE');

  const { productList, saleList } = props;

  useEffect(() => {
    props.getSales();
  }, []);

  const updateProduct = sale => {
    switch (sale.state) {
      case 'IN_CHARGE':
        props.updateSale({ ...sale, state: State.SHIPPED });
        break;
      case 'SHIPPED':
        props.updateSale({ ...sale, state: State.DELIVERED });
        break;
      default:
        break;
    }
  };

  const renderByState = () => {
    let button;

    if (tab === State.DELIVERED) {
      button = null;
    } else if (tab === State.IN_CHARGE) {
      button = 'ENVIAR';
    } else {
      button = 'ENTREGAR';
    }

    if (saleList.length > 0) {
      const copy = [...saleList];
      // eslint-disable-next-line no-console
      console.log(copy);
      return saleList
        .filter(sale => {
          if (sale.state === tab) {
            return true;
          }
          return false;
        })
        .map((sale, index) => {
          return (
            <TableRow key={index}>
              <TableCell>{sale.id}</TableCell>
              <TableCell>{sale.product.name}</TableCell>
              <TableCell>{sale.state}</TableCell>
              <TableCell>
                {button ? (
                  <Button onClick={() => updateProduct(sale)} color="primary" size="small" variant="contained">
                    {button}
                  </Button>
                ) : (
                  button
                )}
              </TableCell>
            </TableRow>
          );
        });
    }
  };

  const handleChange = (event: React.ChangeEvent<{}>, newValue: string) => {
    setTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Tabs indicatorColor="primary" onChange={handleChange} value={tab} variant="fullWidth">
        <Tab value={'IN_CHARGE'} label="ENCARGADO"></Tab>
        <Tab value={'SHIPPED'} label="ENVIADO"></Tab>
        <Tab value={'DELIVERED'} label="ENTREGADO"></Tab>
      </Tabs>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nro</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderByState()}</TableBody>
      </Table>
    </Container>
  );
};

const mapStateToProps = ({ product, sales }: IRootState) => ({
  productList: product.entities,
  saleList: sales.entities,
  loading: product.loading,
});

const mapDispatchToProps = {
  getSales,
  updateSale,
};

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = typeof mapDispatchToProps;

export default connect(mapStateToProps, mapDispatchToProps)(ProductState);
