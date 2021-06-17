import * as cdk from '@aws-cdk/core';
import * as appmesh from "@aws-cdk/aws-appmesh";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ec2 from "@aws-cdk/aws-ec2";
import { AppMeshExtension, Container, Environment, HttpLoadBalancerExtension, Service, ServiceBuild, ServiceExtension, ServiceDescription } from '@aws-cdk-containers/ecs-service-extensions';

export class AppmeshEcsexecFargateSvcStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'app-mesh-ecs-exec-vpc')
    const cluster = new ecs.Cluster(this, 'app-mesh-ecs-exec-cluster', { vpc })

    const environment = new Environment(this, 'production', { vpc, cluster })
    const mesh = new appmesh.Mesh(this, 'my-mesh')
    const svcDescription = new ServiceDescription()
    svcDescription.add(new Container({
      cpu: 1024,
      memoryMiB: 2048,
      trafficPort: 80,
      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
    }))
    svcDescription.add(new AppMeshExtension({ mesh }))
    svcDescription.add(new HttpLoadBalancerExtension())
    svcDescription.add(new EcsExecEnabledServiceExtension())
    const webService = new Service(this, 'svc-app-mesh-ecs-exec', {
      environment: environment,
      serviceDescription: svcDescription,
    })
  }
}

export class EcsExecEnabledServiceExtension extends ServiceExtension {
  constructor() {
    super('ecs-exec-enabled-service');
  }

  public modifyServiceProps(props: ServiceBuild) {
    return {
      ...props,
      enableExecuteCommand: true
    } as ServiceBuild;
  }
}
